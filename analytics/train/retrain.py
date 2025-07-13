import json
import glob
from analytics.logger import logger
import os
from datetime import datetime

import numpy as np
import tensorflow as tf

from analytics.lstm import SpreadLSTM




def load_latest_features(pattern="**/features*.npz"):
    """Return feature arrays from the most recently modified npz file."""
    files = glob.glob(pattern, recursive=True)
    if not files:
        raise FileNotFoundError("No features.npz files found")
    latest = max(files, key=os.path.getmtime)
    data = np.load(latest)
    X = data["X"]
    y = data["y"]
    logger.info("Loaded features from %s", latest)
    return X, y, latest


def compute_sharpe(returns: np.ndarray) -> float:
    mean = returns.mean()
    std = returns.std(ddof=1)
    if std == 0:
        return 0.0
    return float(mean / std)


def main():
    X, y, path = load_latest_features()
    timesteps, features = X.shape[1], X.shape[2]
    model = SpreadLSTM(timesteps, features)

    split_idx = int(0.8 * len(X))
    X_train, y_train = X[:split_idx], y[:split_idx]
    X_val, y_val = X[split_idx:], y[split_idx:]

    history = model.train(X_train, y_train, epochs=10, batch_size=32)
    model.model.save("model.h5")

    val_preds = model.predict(X_val).flatten()
    loss_fn = tf.keras.losses.BinaryCrossentropy()
    val_loss = float(loss_fn(y_val, val_preds).numpy())

    pred_labels = (val_preds > 0.5).astype(int)
    win_rate = float((pred_labels == y_val.flatten()).mean())
    returns = np.where(pred_labels == y_val.flatten(), 1.0, -1.0)
    sharpe = compute_sharpe(returns)

    metadata = {
        "timestamp": datetime.utcnow().isoformat(),
        "features_file": path,
        "val_loss": val_loss,
        "sharpe": sharpe,
        "win_rate": win_rate,
    }
    logger.info("Training results: %s", metadata)
    with open("training_log.json", "a") as f:
        json.dump(metadata, f)
        f.write("\n")


if __name__ == "__main__":
    main()
