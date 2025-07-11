from .logger import logger
import argparse
import numpy as np
import joblib

from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.models import save_model


# Configure logging via centralized logger


def generate_data(num_samples=10000, threshold=0.0, reshape_for_lstm=False):
    """Generate synthetic spread data and labels."""
    net_edge = np.random.normal(loc=0.5, scale=0.2, size=(num_samples, 1))
    slippage = np.random.normal(loc=0.1, scale=0.05, size=(num_samples, 1))
    volatility = np.abs(np.random.normal(loc=1.0, scale=0.3, size=(num_samples, 1)))
    latency = np.random.uniform(low=0.01, high=1.0, size=(num_samples, 1))

    profit = net_edge - slippage - 0.2 * volatility - 0.1 * latency
    labels = (profit > threshold).astype(int)

    features = np.hstack([net_edge, slippage, volatility, latency])
    if reshape_for_lstm:
        return features.reshape((num_samples, 1, 4)), labels
    return features, labels


def train_sklearn(X: np.ndarray, y: np.ndarray, epochs: int = 5):
    model = LinearRegression()
    for epoch in range(1, epochs + 1):
        model.fit(X, y)
        preds = model.predict(X)
        loss = mean_squared_error(y, preds)
        logger.info("Epoch %s - MSE: %.4f", epoch, loss)
    joblib.dump(model, "model.joblib")
    logger.info("Model saved to model.joblib")


def train_tensorflow(X: np.ndarray, y: np.ndarray, epochs: int = 5):
    model = Sequential([
        LSTM(16, input_shape=(1, 4)),
        Dense(1, activation="sigmoid")
    ])
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    model.fit(X, y, epochs=epochs, batch_size=32, verbose=1)
    save_model(model, "model.h5")
    logger.info("Model saved to model.h5")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--framework", choices=["sklearn", "tf"], default="sklearn")
    parser.add_argument("--epochs", type=int, default=5)
    args = parser.parse_args()

    if args.framework == "sklearn":
        X, y = generate_data(reshape_for_lstm=False)
        train_sklearn(X, y, epochs=args.epochs)
    else:
        X, y = generate_data(reshape_for_lstm=True)
        train_tensorflow(X, y, epochs=args.epochs)


if __name__ == "__main__":
    main()

