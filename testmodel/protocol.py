"""
FIOR protocol operations: encoding, aggregation, verification.

Simulates the full protocol flow:
  1. Aggregator publishes prior (zero natural params)
  2. Nodes train locally → produce posterior natural params
  3. Aggregator sums diffs → new global prior
  4. Verify convergence to ground truth
"""

import numpy as np
from .model import BayesianLinearRegression


def encode_hex(eta: np.ndarray) -> str:
    """Encode float64 LE natural parameter vector as hex string."""
    return eta.astype("<f8").tobytes().hex()


def decode_hex(data: str) -> np.ndarray:
    """Decode hex string back to float64 LE natural parameter vector."""
    return np.frombuffer(bytes.fromhex(data), dtype="<f8")


def prior_diff(
    posterior_eta: np.ndarray, prior_eta: np.ndarray
) -> np.ndarray:
    """
    Compute η_diff = η_posterior - η_prior.

    This is the per-node contribution that the aggregator sums.
    """
    return posterior_eta - prior_eta


def aggregate(
    global_eta: np.ndarray, eta_diffs: list[np.ndarray]
) -> np.ndarray:
    """
    Stage 1 aggregation: unweighted sum of η differences.

    η_global_new = η_global + Σ η_diff_i
    """
    result = global_eta.copy()
    for diff in eta_diffs:
        result += diff
    return result


def simulate_federation(
    n_nodes: int = 5,
    n_samples: int = 1000,
    feature_noise: float = 0.05,
    seed: int = 42,
    n_vi_iters: int = 20,
) -> dict:
    """
    Run a full simulated federation round.

    Returns results including convergence metrics for protocol validation.
    """
    from .generator import DataGenerator

    gen = DataGenerator(seed=seed, n_samples=n_samples)
    true_params = gen.true_parameters
    param_names = gen.parameter_names

    # Aggregator state
    n_params = len(true_params)
    global_eta = np.zeros(2 * n_params, dtype=np.float64)

    node_results = []
    eta_diffs = []

    for node_id in range(n_nodes):
        node_seed = seed + node_id + 1
        data = gen.generate_node(node_seed=node_seed, feature_noise=feature_noise)

        # Node loads prior (global η) and trains locally
        model = BayesianLinearRegression(
            n_features=4,
            prior_mean=0.0,
            prior_std=10.0,
            noise_std=gen.noise_std,
        )

        prior_eta = model.prior_natural_parameters()
        model.load_natural_parameters(global_eta)
        model.fit(data["X"], data["y"], n_iters=n_vi_iters)

        posterior_eta = model.natural_parameters()
        diff = prior_diff(posterior_eta, global_eta)
        eta_diffs.append(diff)

        node_results.append(
            {
                "node_id": node_id,
                "node_seed": node_seed,
                "post_mean": model.post_mean.copy(),
                "post_std": np.sqrt(model.post_var),
                "natural_eta": posterior_eta.copy(),
                "eta_diff": diff.copy(),
            }
        )

    # Aggregation
    global_eta = aggregate(global_eta, eta_diffs)

    # Decode aggregated posterior
    agg_model = BayesianLinearRegression(n_features=4)
    agg_model.load_natural_parameters(global_eta)

    # Verification: aggregated parameters should approach true_params
    error = agg_model.post_mean - true_params
    mae = np.mean(np.abs(error))
    rmse = np.sqrt(np.mean(error**2))

    return {
        "n_nodes": n_nodes,
        "n_samples": n_samples,
        "n_params": n_params,
        "param_names": param_names,
        "true_parameters": true_params,
        "aggregated_mean": agg_model.post_mean.copy(),
        "aggregated_std": np.sqrt(agg_model.post_var),
        "global_eta": global_eta,
        "mae_vs_truth": mae,
        "rmse_vs_truth": rmse,
        "node_results": node_results,
    }
