"""
Bayesian linear regression with mean-field variational inference.

Implements a per-parameter independent Normal approximation (mean-field)
to the posterior of a Bayesian linear regression model. This matches the
FIOR protocol's per-parameter natural parameter encoding.

Each parameter w_j has:
  q(w_j) = Normal(μ_j, σ²_j)

Natural parameters for Normal distribution:
  η₁_j = μ_j / σ²_j
  η₂_j = -1 / (2 * σ²_j)

The variational updates use coordinate ascent on the ELBO.
"""

import numpy as np


class BayesianLinearRegression:
    """
    Mean-field variational Bayesian linear regression.

    Prior: w_j ~ Normal(μ_prior, σ²_prior) for each parameter.
    Likelihood: y ~ Normal(Xw + b, σ²_noise) with known σ²_noise.
    """

    def __init__(
        self,
        n_features: int,
        prior_mean: float = 0.0,
        prior_std: float = 10.0,
        noise_std: float = 0.1,
    ):
        self.n_features = n_features
        self.n_params = n_features + 1

        self.prior_mean = np.full(self.n_params, prior_mean, dtype=np.float64)
        self.prior_var = np.full(self.n_params, prior_std**2, dtype=np.float64)
        self.noise_var = noise_std**2

        # Posterior q(w_j) = Normal(μ_j, σ²_j)
        self.post_mean = self.prior_mean.copy()
        self.post_var = self.prior_var.copy()

    def fit(self, X: np.ndarray, y: np.ndarray, n_iters: int = 20) -> None:
        """
        Run mean-field coordinate ascent VI.

        Updates each parameter's posterior independently, iterating until
        convergence or max iterations.
        """
        n = len(y)
        # Design matrix with bias column
        X_design = np.column_stack([X, np.ones(n, dtype=np.float64)])

        prior_precision = 1.0 / self.prior_var
        noise_precision = 1.0 / self.noise_var

        # Initialize posteriors at prior
        self.post_mean = self.prior_mean.copy()
        self.post_var = self.prior_var.copy()

        for _ in range(n_iters):
            old_mean = self.post_mean.copy()

            for j in range(self.n_params):
                # Compute residual without parameter j
                residual = y - X_design @ self.post_mean + X_design[:, j] * self.post_mean[j]

                x_col = X_design[:, j]
                sum_x2 = np.sum(x_col**2)
                sum_xr = np.sum(x_col * residual)

                post_precision_j = prior_precision[j] + noise_precision * sum_x2
                self.post_var[j] = 1.0 / post_precision_j
                self.post_mean[j] = (
                    prior_precision[j] * self.prior_mean[j] + noise_precision * sum_xr
                ) / post_precision_j

            if np.max(np.abs(self.post_mean - old_mean)) < 1e-8:
                break

    def natural_parameters(self) -> np.ndarray:
        """
        Encode posterior as natural parameters.

        Returns array of shape (2 * n_params,) containing:
          [η₁_0, η₁_1, ..., η₁_k, η₂_0, η₂_1, ..., η₂_k]

        where k = n_params - 1.
        """
        eta1 = self.post_mean / self.post_var
        eta2 = -0.5 / self.post_var
        return np.concatenate([eta1, eta2])

    def prior_natural_parameters(self) -> np.ndarray:
        """Natural parameters of the prior distribution."""
        eta1 = self.prior_mean / self.prior_var
        eta2 = -0.5 / self.prior_var
        return np.concatenate([eta1, eta2])

    def load_natural_parameters(self, eta: np.ndarray) -> None:
        k = self.n_params
        eta1 = eta[:k]
        eta2 = eta[k:]

        # Zero η₂ = infinite variance = no information → use prior
        with np.errstate(divide="ignore", invalid="ignore"):
            inv_eta2 = np.where(np.abs(eta2) < 1e-30, 0.0, -0.5 / eta2)
        self.post_var = np.where(np.abs(eta2) < 1e-30, self.prior_var, inv_eta2)
        self.post_mean = np.where(
            np.abs(eta2) < 1e-30, self.prior_mean, eta1 * self.post_var
        )

    def posterior_summary(self) -> dict:
        """Return human-readable posterior summary."""
        return {
            "mean": self.post_mean.copy(),
            "std": np.sqrt(self.post_var),
            "natural_eta1": self.post_mean / self.post_var,
            "natural_eta2": -0.5 / self.post_var,
        }
