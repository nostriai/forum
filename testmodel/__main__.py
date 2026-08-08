"""
CLI entry point for FIOR test model.

Called by the Go aggregator/e2e test runner. Outputs JSON to stdout.

Usage:
  python -m testmodel.train --seed 42 --samples 1000 --noise 0.05 --node 1
  python -m testmodel.train --seed 42 --samples 1000 --noise 0.05 --node 1 --output /tmp/posterior.json
"""

import argparse
import json
import sys
from .generator import DataGenerator
from .model import BayesianLinearRegression
from .protocol import encode_hex


def run(args):
    gen = DataGenerator(
        seed=args.seed,
        n_samples=args.samples,
        noise_std=args.noise_std if hasattr(args, "noise_std") else 0.1,
    )

    data = gen.generate_node(
        node_seed=args.node, feature_noise=args.feature_noise
    )

    model = BayesianLinearRegression(
        n_features=4,
        prior_mean=args.prior_mean,
        prior_std=args.prior_std,
        noise_std=gen.noise_std,
    )

    model.fit(data["X"], data["y"], n_iters=args.iters)

    eta = model.natural_parameters()

    result = {
        "node_seed": args.node,
        "n_samples": args.samples,
        "post_mean": model.post_mean.tolist(),
        "post_std": model.post_var.tolist(),
        "natural_eta": encode_hex(eta),
        "natural_eta_raw": eta.tolist(),
        "param_names": gen.parameter_names,
        "true_parameters": gen.true_parameters.tolist(),
    }

    output = json.dumps(result, indent=2)

    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
    else:
        print(output)


def main():
    parser = argparse.ArgumentParser(description="FIOR test model trainer")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--samples", type=int, default=1000)
    parser.add_argument("--noise-std", type=float, default=0.1)
    parser.add_argument("--feature-noise", type=float, default=0.05)
    parser.add_argument("--node", type=int, default=1)
    parser.add_argument("--prior-mean", type=float, default=0.0)
    parser.add_argument("--prior-std", type=float, default=10.0)
    parser.add_argument("--iters", type=int, default=20)
    parser.add_argument("--output", type=str, default="")
    parser.add_argument("--generate-only", action="store_true",
                        help="Generate data only, skip training")
    args = parser.parse_args()
    run(args)


if __name__ == "__main__":
    main()
