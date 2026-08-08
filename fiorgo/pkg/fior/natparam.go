package fior

import (
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"math"
)

// DecodeNaturalParams decodes a hex-encoded natural parameter vector into two
// float64 slices: eta1 (mean parameters) and eta2 (precision parameters).
// The input is LE float64 binary encoded as lowercase hex.
func DecodeNaturalParams(data string, dim int) (eta1, eta2 []float64, err error) {
	raw, err := hex.DecodeString(data)
	if err != nil {
		return nil, nil, fmt.Errorf("hex decode: %w", err)
	}

	expectedLen := dim * 2 * 8 // 2*dim float64 LE
	if len(raw) != expectedLen {
		return nil, nil, fmt.Errorf(
			"expected %d bytes for dim=%d, got %d", expectedLen, dim, len(raw),
		)
	}

	eta1 = make([]float64, dim)
	eta2 = make([]float64, dim)

	for i := range dim {
		offset := i * 8
		eta1[i] = math.Float64frombits(binary.LittleEndian.Uint64(raw[offset : offset+8]))
		eta2[i] = math.Float64frombits(binary.LittleEndian.Uint64(raw[offset+dim*8 : offset+dim*8+8]))
	}

	return eta1, eta2, nil
}

// EncodeNaturalParams encodes eta1 and eta2 as a hex string (LE float64).
func EncodeNaturalParams(eta1, eta2 []float64) string {
	dim := len(eta1)
	buf := make([]byte, dim*2*8)

	for i, v := range eta1 {
		binary.LittleEndian.PutUint64(buf[i*8:], math.Float64bits(v))
	}

	offset := dim * 8
	for i, v := range eta2 {
		binary.LittleEndian.PutUint64(buf[offset+i*8:], math.Float64bits(v))
	}

	return hex.EncodeToString(buf)
}

// Aggregate sums a set of η-difference vectors into the global η.
// Diff is posterior minus prior for each node. Simple unweighted sum (stage 1).
func Aggregate(globalEta1, globalEta2 []float64, diffs [][2][]float64) {
	for _, diff := range diffs {
		for i := range globalEta1 {
			globalEta1[i] += diff[0][i]
			globalEta2[i] += diff[1][i]
		}
	}
}

// Diff computes η_posterior - η_prior for each parameter.
func Diff(posteriorEta1, posteriorEta2, priorEta1, priorEta2 []float64) ([]float64, []float64) {
	dim := len(posteriorEta1)
	d1 := make([]float64, dim)
	d2 := make([]float64, dim)
	for i := range dim {
		d1[i] = posteriorEta1[i] - priorEta1[i]
		d2[i] = posteriorEta2[i] - priorEta2[i]
	}
	return d1, d2
}
