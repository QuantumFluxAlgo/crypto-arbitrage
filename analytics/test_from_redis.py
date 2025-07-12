import numpy as np
from analytics.redis_retrain import prepare_sequences

def test_prepare_sequences_returns_correct_shapes():
    spreads = np.linspace(-1, 1, 15, dtype=np.float32)
    X, y = prepare_sequences(spreads, timesteps=5)
    assert X.shape == (10, 5, 1)
    assert y.shape == (10,)
    assert y.dtype == np.float32
