"""
Deterministic data generator for FIOR protocol testing.

Generates 4-feature time series datasets with a known ground-truth linear
model. Each simulated "node" receives a variant dataset with controlled
noise, enabling verification that federated aggregation recovers the true
parameters.
"""

import numpy as np


class DataGenerator:
    """
    Generates synthetic time series data for a 4-feature input model
    with a linear ground truth and known noise characteristics.

    The true model: y = w1*x1 + w2*x2 + w3*x3 + w4*x4 + b + noise

    Each feature has a characteristic temporal pattern:
      x1: sinusoidal (periodic seasonal effect)
      x2: linear drift (gradual degradation)
      x3: square wave (discrete state changes)
      x4: smoothed random walk (cumulative stochastic process)
    """

    def __init__(
        self,
        seed: int = 42,
        n_samples: int = 1000,
        time_start: float = 0.0,
        time_end: float = 100.0,
        noise_std: float = 0.1,
    ):
        self.rng = np.random.default_rng(seed)
        self.n_samples = n_samples
        self.time_start = time_start
        self.time_end = time_end
        self.noise_std = noise_std

        self.time = np.linspace(time_start, time_end, n_samples)

        # Ground-truth parameters (what aggregation should recover)
        self.true_w = np.array([0.5, -0.3, 1.2, -0.8], dtype=np.float64)
        self.true_b = np.float64(0.1)

    def _generate_features(self, noise_scale: float = 0.0) -> np.ndarray:
        """Generate the 4 feature time series with optional noise."""
        t = self.time
        T = self.time_end - self.time_start

        x1 = np.sin(2.0 * np.pi * t / (T / 3.0))
        x1 += noise_scale * self.rng.normal(0, 1, self.n_samples)

        x2 = (t - self.time_start) / T
        x2 += noise_scale * self.rng.normal(0, 1, self.n_samples)

        x3 = np.where(np.sin(2.0 * np.pi * t / (T / 7.0)) > 0, 1.0, -1.0)
        x3 += noise_scale * self.rng.normal(0, 1, self.n_samples)

        # Smoothed random walk
        steps = self.rng.normal(0, 1.0, self.n_samples)
        x4 = np.cumsum(steps) / np.sqrt(self.n_samples)
        x4 = (x4 - x4.mean()) / x4.std()
        x4 += noise_scale * self.rng.normal(0, 1, self.n_samples)

        return np.column_stack([x1, x2, x3, x4])

    def generate_base(self) -> dict:
        """Generate the base dataset (no feature noise)."""
        X = self._generate_features(noise_scale=0.0)
        y = X @ self.true_w + self.true_b
        y += self.rng.normal(0, self.noise_std, self.n_samples)
        return {"X": X, "y": y, "time": self.time}

    def generate_node(
        self, node_seed: int, feature_noise: float = 0.05, label_flip_prob: float = 0.0
    ) -> dict:
        """
        Generate a dataset for one federated node.

        Each node sees the base pattern plus:
        - Feature measurement noise (sensor imprecision)
        - Optional label noise (misclassified outcomes)

        The node seed determines the exact noise pattern. Same seed always
        produces the same dataset.
        """
        node_rng = np.random.default_rng(node_seed)

        X = self._generate_features(noise_scale=feature_noise)

        y = X @ self.true_w + self.true_b
        y += node_rng.normal(0, self.noise_std, self.n_samples)

        if label_flip_prob > 0:
            flip_mask = node_rng.random(self.n_samples) < label_flip_prob
            y[flip_mask] += node_rng.normal(
                0, self.noise_std * 10, np.sum(flip_mask)
            )

        return {"X": X, "y": y, "time": self.time, "node_seed": node_seed}

    @property
    def true_parameters(self) -> np.ndarray:
        """Ground truth parameter vector [w1, w2, w3, w4, b]."""
        return np.append(self.true_w, self.true_b)

    @property
    def parameter_names(self) -> list[str]:
        return ["w1", "w2", "w3", "w4", "bias"]
