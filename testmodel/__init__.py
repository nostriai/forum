"""
testmodel - FIOR protocol test model and data generator.

Provides deterministic synthetic data generation, a Bayesian linear
regression model with mean-field variational inference, and protocol
simulation for validating the FIOR event kinds.
"""

from .generator import DataGenerator
from .model import BayesianLinearRegression
from .protocol import (
    encode_hex,
    decode_hex,
    prior_diff,
    aggregate,
    simulate_federation,
)

__all__ = [
    "DataGenerator",
    "BayesianLinearRegression",
    "encode_hex",
    "decode_hex",
    "prior_diff",
    "aggregate",
    "simulate_federation",
]
