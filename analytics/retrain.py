import argparse
import hashlib
from .logger import logger
import os

_dry_run_env = os.getenv("DRY_RUN")
if _dry_run_env is None:
    DRY_RUN = os.getenv("EXECUTION_MODE", "").upper() == "DRY_RUN"
else:
    DRY_RUN = _dry_run_env.lower() == "true"
import socket
import subprocess
import shutil
from pathlib import Path

import numpy as np
from tensorflow.keras.models import Sequential, save_model
from tensorflow.keras.layers import LSTM, Dense

from .train import generate_data
from .model_tracker import insert_metadata, send_event



def train_model(epochs: int = 5):
    """Train a simple LSTM model and save to model.h5."""
    X, y = generate_data(reshape_for_lstm=True)
    model = Sequential([
        LSTM(16, input_shape=(1, 4)),
        Dense(1, activation="sigmoid")
    ])
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    history = model.fit(X, y, epochs=epochs, batch_size=32, verbose=0)
    save_model(model, "model.h5")
    logger.info("Model saved to model.h5")

    preds = (model.predict(X) > 0.5).astype(int)
    win_rate = float(np.mean(preds.flatten() == y.flatten()))
    sharpe = float(preds.mean() / preds.std()) if preds.std() != 0 else 0.0
    val_loss = float(history.history["loss"][-1])

    return win_rate, sharpe, val_loss


def file_hash(path: str) -> str:
    with open(path, "rb") as f:
        data = f.read()
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--notes", type=str, default="")
    args = parser.parse_args()

    win_rate, sharpe, val_loss = train_model(args.epochs)
    version_hash = file_hash("model.h5")
    user = os.getenv("USER", "unknown")
    try:
        ip = socket.gethostbyname(socket.gethostname())
    except Exception:
        ip = None

    if not DRY_RUN:
        insert_metadata(
            version_hash,
            sharpe=sharpe,
            win_rate=win_rate,
            val_loss=val_loss,
            notes=args.notes,
            changed_by=user,
            change_type="train",
            source_ip=ip
        )

        send_event(version_hash, "train", user, ip)
        logger.info("Logged metadata with hash %s", version_hash)
    else:
        logger.info("[DRY-RUN] Metadata logging skipped")

    # Notify via Node.js CLI alert script
    script = Path(__file__).resolve().parents[1] / 'api' / 'cli' / 'alertModelUpdate.js'
    node_bin = shutil.which('node')
    if not DRY_RUN and node_bin:
        try:
            subprocess.run(
                [node_bin, str(script), '--version', version_hash, '--accuracy', f"{win_rate:.2f}"],
                check=False
            )
        except Exception as exc:
            logger.warning("Failed to send model update alert: %s", exc)
    elif not node_bin:
        logger.warning("Node.js not found; skipping model update alert")
    else:
        logger.info("[DRY-RUN] Model update alert skipped")



if __name__ == "__main__":
    main()
