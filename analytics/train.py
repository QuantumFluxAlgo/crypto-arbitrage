import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense


def generate_data(num_samples=10000, threshold=0.0):
    """Generate synthetic spread data and labels."""
    net_edge = np.random.normal(loc=0.5, scale=0.2, size=(num_samples, 1))
    slippage = np.random.normal(loc=0.1, scale=0.05, size=(num_samples, 1))
    volatility = np.abs(np.random.normal(loc=1.0, scale=0.3, size=(num_samples, 1)))
    latency = np.random.uniform(low=0.01, high=1.0, size=(num_samples, 1))

    profit = net_edge - slippage - 0.2 * volatility - 0.1 * latency
    labels = (profit > threshold).astype(int)

    features = np.hstack([net_edge, slippage, volatility, latency])
    return features.reshape((num_samples, 1, 4)), labels


def build_model():
    """Create a simple LSTM model for classification."""
    model = Sequential([
        LSTM(16, input_shape=(1, 4)),
        Dense(1, activation="sigmoid")
    ])
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    return model


def main():
    X, y = generate_data()
    model = build_model()
    model.fit(X, y, epochs=5, batch_size=32, verbose=1)
    model.save("model.h5")


if __name__ == "__main__":
    main()
