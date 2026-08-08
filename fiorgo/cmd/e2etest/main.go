package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"time"

	"git.smesh.lol/orly/pkg/nostr/encoders/event"
	"git.smesh.lol/orly/pkg/nostr/encoders/tag"
	"git.smesh.lol/orly/pkg/nostr/interfaces/signer"
	"git.smesh.lol/orly/pkg/nostr/interfaces/signer/p8k"
	"git.smesh.lol/orly/pkg/nostr/ws"

	"git.smesh.lol/fiorgo/pkg/fior"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	relayURL := getEnv("FIOR_RELAY", "wss://test.nostri.ai/")
	nNodes := 3
	nSamples := 2000
	seed := int64(42)
	noiseStd := 0.1
	featureNoise := 0.05
	nIters := 30
	dim := 5

	fmt.Printf("=== FIOR E2E Test ===\n")
	fmt.Printf("relay: %s\n", relayURL)
	fmt.Printf("nodes: %d, samples: %d, seed: %d\n", nNodes, nSamples, seed)
	fmt.Println()

	// Step 1: Generate keypair
	fmt.Println("[1/8] generating keypair...")
	keys := p8k.MustNew()
	if err := keys.Generate(); err != nil {
		return fmt.Errorf("generate key: %w", err)
	}
	fmt.Printf("  pubkey: %x...\n", keys.Pub()[:8])

	// Step 2: Connect to relay
	fmt.Println("[2/8] connecting to relay...")
	client, err := ws.RelayConnect(ctx, relayURL)
	if err != nil {
		return fmt.Errorf("connect: %w", err)
	}
	defer client.Close()
	fmt.Println("  connected")

	// Step 3: Publish model card
	fmt.Println("[3/8] publishing model card...")
	modelCardEv, err := publishModelCard(ctx, keys, client)
	if err != nil {
		return fmt.Errorf("publish model card: %w", err)
	}
	fmt.Printf("  event ID: %x...\n", modelCardEv.ID[:8])

	// Step 4: Publish initial prior (zero η)
	fmt.Println("[4/8] publishing initial prior...")
	initialPriorEv, err := publishPrior(ctx, keys, client, "test-model-v1", 0, dim)
	if err != nil {
		return fmt.Errorf("publish initial prior: %w", err)
	}
	priorID := fmt.Sprintf("%x", initialPriorEv.ID)
	fmt.Printf("  event ID: %s...\n", priorID[:16])

	// Step 5: Run Python testmodel for each node
	fmt.Printf("[5/8] training %d nodes via Python testmodel...\n", nNodes)
	posteriors := make([]posteriorResult, nNodes)
	trueParams := make([]float64, dim)

	for i := range nNodes {
		nodeSeed := seed + int64(i) + 1
		result, err := runPythonTestmodel(nodeSeed, nSamples, noiseStd, featureNoise, nIters)
		if err != nil {
			return fmt.Errorf("node %d: %w", i, err)
		}
		posteriors[i] = result
		copy(trueParams, result.TrueParams)
		fmt.Printf("  node %d: seed=%d trained\n", i, nodeSeed)
	}

	// Step 6: Publish posteriors to relay
	fmt.Println("[6/8] publishing posteriors to relay...")
	for i, post := range posteriors {
		_, err := publishPosterior(
			ctx, keys, client, "test-model-v1", priorID, post.NaturalEta,
		)
		if err != nil {
			return fmt.Errorf("publish posterior %d: %w", i, err)
		}
		fmt.Printf("  node %d: published\n", i)
	}

	// Step 7: Aggregate locally
	fmt.Println("[7/8] aggregating...")
	globalEta1 := make([]float64, dim)
	globalEta2 := make([]float64, dim)

	for _, post := range posteriors {
		eta1, eta2, err := fior.DecodeNaturalParams(post.NaturalEta, dim)
		if err != nil {
			return fmt.Errorf("decode posterior: %w", err)
		}
		fior.Aggregate(globalEta1, globalEta2, [][2][]float64{{eta1, eta2}})
	}
	fmt.Println("  aggregated")

	// Step 8: Publish new prior with aggregated η
	fmt.Println("[8/8] publishing aggregated prior...")
	aggEta := fior.EncodeNaturalParams(globalEta1, globalEta2)
	_, err = publishPriorWithEta(ctx, keys, client, "test-model-v1", 1, aggEta)
	if err != nil {
		return fmt.Errorf("publish aggregated prior: %w", err)
	}
	fmt.Println("  published")

	// Verify against ground truth
	fmt.Println()
	fmt.Println("=== Results ===")
	fmt.Printf("%-6s %12s %12s %12s\n", "param", "truth", "aggr_mean", "error")
	maeSum := 0.0

	for i, name := range []string{"w1", "w2", "w3", "w4", "bias"} {
		sigma2 := -0.5 / globalEta2[i]
		mu := globalEta1[i] * sigma2
		err := mu - trueParams[i]
		abserr := err
		if abserr < 0 {
			abserr = -abserr
		}
		maeSum += abserr
		fmt.Printf("%-6s %12.6f %12.6f %12.6f\n", name, trueParams[i], mu, err)
	}
	mae := maeSum / float64(dim)
	fmt.Printf("\nMAE: %.6f\n", mae)

	if mae < 0.3 {
		fmt.Println("PASS: federated aggregation converged near ground truth")
	} else {
		fmt.Println("WARN: aggregation diverged from ground truth")
	}

	return nil
}

type posteriorResult struct {
	NodeSeed      int       `json:"node_seed"`
	NaturalEta    string    `json:"natural_eta"`
	NaturalEtaRaw []float64 `json:"natural_eta_raw"`
	PostMean      []float64 `json:"post_mean"`
	TrueParams    []float64 `json:"true_parameters"`
}

func runPythonTestmodel(seed int64, samples int, noiseStd, featureNoise float64, iters int) (posteriorResult, error) {
	scriptDir := os.Getenv("FIOR_TESTMODEL_DIR")
	if scriptDir == "" {
		scriptDir = "."
	}

	args := []string{
		"-m", "testmodel",
		"--seed", fmt.Sprintf("%d", seed),
		"--samples", fmt.Sprintf("%d", samples),
		"--noise-std", fmt.Sprintf("%f", noiseStd),
		"--feature-noise", fmt.Sprintf("%f", featureNoise),
		"--node", fmt.Sprintf("%d", seed),
		"--iters", fmt.Sprintf("%d", iters),
	}

	cmd := exec.Command("python3", args...)
	cmd.Dir = scriptDir

	output, err := cmd.Output()
	if err != nil {
		var exitErr *exec.ExitError
		if errors.As(err, &exitErr) {
			return posteriorResult{}, fmt.Errorf("python: %s", string(exitErr.Stderr))
		}
		return posteriorResult{}, fmt.Errorf("exec python: %w", err)
	}

	var result posteriorResult
	if err := json.Unmarshal(output, &result); err != nil {
		return posteriorResult{}, fmt.Errorf("parse python output: %w\nraw: %s", err, string(output))
	}

	return result, nil
}

func publishModelCard(ctx context.Context, keys signer.I, client *ws.Client) (*event.E, error) {
	content := map[string]interface{}{
		"framework":   "testmodel",
		"description": "FIOR protocol test model - Bayesian linear regression",
	}
	contentJSON, _ := json.Marshal(content)

	ev := &event.E{
		Kind:      fior.KindModelCard,
		CreatedAt: time.Now().Unix(),
		Content:   contentJSON,
		Tags: tag.NewS(
			tag.NewFromAny("d", "test-model-v1"),
			tag.NewFromAny("title", "FIOR Test Model"),
			tag.NewFromAny("summary", "4-feature Bayesian linear regression"),
			tag.NewFromAny("version", "1.0"),
			tag.NewFromAny("group", "params", "normal", "w1", "w2", "w3", "w4", "bias"),
		),
	}

	if err := ev.Sign(keys); err != nil {
		return nil, fmt.Errorf("sign: %w", err)
	}

	if err := client.Publish(ctx, ev); err != nil {
		return nil, fmt.Errorf("publish: %w", err)
	}

	return ev, nil
}

func publishPrior(
	ctx context.Context, keys signer.I, client *ws.Client,
	modelID string, round int, dim int,
) (*event.E, error) {
	eta := fior.EncodeNaturalParams(make([]float64, dim), make([]float64, dim))
	return publishPriorWithEta(ctx, keys, client, modelID, round, eta)
}

func publishPriorWithEta(
	ctx context.Context, keys signer.I, client *ws.Client,
	modelID string, round int, eta string,
) (*event.E, error) {
	ev := &event.E{
		Kind:      fior.KindPriorBroadcast,
		CreatedAt: time.Now().Unix(),
		Content:   []byte(fmt.Sprintf(`{"round":%d}`, round)),
		Tags: tag.NewS(
			tag.NewFromAny("d", modelID),
			tag.NewFromAny("η", "params", "hex", eta),
		),
	}

	if err := ev.Sign(keys); err != nil {
		return nil, fmt.Errorf("sign: %w", err)
	}

	if err := client.Publish(ctx, ev); err != nil {
		return nil, fmt.Errorf("publish: %w", err)
	}

	return ev, nil
}

func publishPosterior(
	ctx context.Context, keys signer.I, client *ws.Client,
	modelID, priorID, eta string,
) (*event.E, error) {
	ev := &event.E{
		Kind:      fior.KindPosteriorSubmit,
		CreatedAt: time.Now().Unix(),
		Content:   []byte(`{}`),
		Tags: tag.NewS(
			tag.NewFromAny("d", modelID),
			tag.NewFromAny("p", priorID),
			tag.NewFromAny("η", "params", "hex", eta),
		),
	}

	if err := ev.Sign(keys); err != nil {
		return nil, fmt.Errorf("sign: %w", err)
	}

	if err := client.Publish(ctx, ev); err != nil {
		return nil, fmt.Errorf("publish: %w", err)
	}

	return ev, nil
}

func getEnv(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}
