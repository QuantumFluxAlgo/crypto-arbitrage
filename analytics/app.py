import os
import sys
import time
from .logger import logger
from collections import deque

import numpy as np
from flask import Flask, g, request, jsonify, Response
from dotenv import load_dotenv
from prometheus_client import (
    CollectorRegistry,
    Counter,
    Histogram,
    ProcessCollector,
    GCCollector,
    generate_latest,
    CONTENT_TYPE_LATEST,
)

from tensorflow.keras.models import load_model as load_keras_model
import tensorflow as tf
import joblib

# Load .env variables
load_dotenv()

logger.info("Analytics app starting")
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    gpu_names = ', '.join(gpu.name for gpu in gpus)
    logger.info("GPU available: %s", gpu_names)
else:
    logger.info("No GPU detected; using CPU")

# Configure Flask
app = Flask(__name__)

# logger imported from centralized module

# Prometheus metrics setup
registry = CollectorRegistry()
ProcessCollector(registry=registry)
GCCollector(registry=registry)

request_count = Counter('request_count', 'Total HTTP requests', registry=registry)
request_latency = Histogram(
    'request_latency_seconds',
    'Request latency in seconds',
    registry=registry,
)
inference_latency = Histogram(
    'inference_latency_seconds',
    'Model inference latency in seconds',
    registry=registry,
)

# In-memory trade store
MAX_TRADES = 1000
trades = deque(maxlen=MAX_TRADES)


def record_trade(pnl: float, timestamp: float | None = None) -> None:
    """Record a trade's PnL in memory using a fixed-size deque."""
    if timestamp is None:
        timestamp = time.time()
    trades.append({"pnl": pnl, "time": timestamp})


def compute_stats():
    """Compute aggregate PnL and Sharpe ratio for all stored trades."""
    if not trades:
        return {"pnl": 0, "sharpe": 0}

    pnl_array = np.array([t["pnl"] for t in trades], dtype=np.float32)
    pnl = pnl_array.sum()
    if len(pnl_array) < 2:
        sharpe = 0.0
    else:
        std = pnl_array.std(ddof=1)
        if std == 0:
            sharpe = 0.0
        else:
            sharpe = pnl_array.mean() / std

    return {"pnl": float(pnl), "sharpe": float(sharpe)}


def rolling_pnl(window: int = 50) -> float:
    """Return the rolling P&L for the last `window` trades."""
    recent = list(trades)[-window:]
    return float(sum(t["pnl"] for t in recent))


def sharpe_ratio(window: int = 50) -> float:
    """Compute the Sharpe ratio for the last `window` trades."""
    recent = list(trades)[-window:]
    if len(recent) < 2:
        return 0.0
    returns = np.array([t['pnl'] for t in recent], dtype=np.float32)
    mean = returns.mean()
    std = returns.std(ddof=1)
    if std == 0:
        return 0.0
    return float(mean / std * np.sqrt(len(returns)))


def recent_performance(days: int = 7) -> dict:
    """Return volatility and win rate for trades within the last `days`."""
    cutoff = time.time() - days * 86400
    recent = [t for t in trades if t["time"] >= cutoff]
    if not recent:
        return {"volatility": 0.0, "win_rate": 0.0}

    pnls = np.array([t["pnl"] for t in recent], dtype=np.float32)
    vol = float(pnls.std(ddof=1)) if len(pnls) > 1 else 0.0
    win_rate = float((pnls > 0).mean())
    return {"volatility": vol, "win_rate": win_rate}

# Load model
MODEL_PATH = os.getenv("MODEL_PATH", "model.h5")
SHADOW_MODEL_PATH = os.getenv("MODEL_SHADOW_PATH", "model_shadow.h5")

def load_model(path: str):
    logger.info("Attempting to load model from %s", path)
    try:
        if path.endswith(".h5"):
            model = load_keras_model(path)
        elif path.endswith(".joblib"):
            model = joblib.load(path)
        else:
            raise ValueError(f"Unsupported model format: {path}")
        logger.info("Model loaded successfully from %s", path)
        return model
    except Exception as e:
        logger.exception("Model loading failed: %s", e)
        return None

try:
    model = load_model(MODEL_PATH)
except Exception as e:
    logger.error("Failed to load model from %s: %s", MODEL_PATH, e)
    model = None

try:
    shadow_model = load_model(SHADOW_MODEL_PATH)
except Exception as e:
    logger.error("Failed to load shadow model from %s: %s", SHADOW_MODEL_PATH, e)
    shadow_model = None

class IdentityModel:
    def predict(self, features):
        return np.array(features)

if model is None:
    model = IdentityModel()
if shadow_model is None:
    shadow_model = IdentityModel()

@app.before_request
def before_request():
    g.start_time = time.time()
    logger.info(f"{request.method} {request.path}")

@app.after_request
def after_request(response):
    latency = time.time() - g.start_time
    request_count.inc()
    request_latency.observe(latency)
    return response

@app.route('/')
def index():
    return 'Hello, World!'

@app.route('/ping')
def ping():
    return jsonify(pong=True)

@app.route('/metrics')
def metrics():
    data = generate_latest(registry)
    return Response(data, mimetype=CONTENT_TYPE_LATEST)

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'model not loaded'}), 500

    logger.info("Prediction started")
    try:
        payload = request.get_json(force=True)
        features = np.array(payload.get("features", payload), dtype=np.float32)
        if len(features.shape) == 1:
            features = features.reshape(1, -1)

        expected_shape = None
        if hasattr(model, "input_shape"):
            expected_shape = tuple(model.input_shape[1:])
        elif hasattr(model, "n_features_in_"):
            expected_shape = (int(model.n_features_in_),)
        if expected_shape and tuple(features.shape[1:]) != expected_shape:
            logger.warning("Invalid input shape: expected %s, got %s", expected_shape, features.shape)
            return jsonify({'error': 'invalid input shape'}), 400

        logger.info("Input shape: %s", features.shape)
        start_inf = time.time()
        preds = model.predict(features)
        duration = time.time() - start_inf
        inference_latency.observe(duration)
        logger.info("Output shape: %s", np.array(preds).shape)
        logger.info("Inference took %.4f seconds", duration)

        shadow_preds = None
        if shadow_model is not None:
            shadow_preds = shadow_model.predict(features)

        response = {'prediction': preds.tolist()}
        if shadow_preds is not None:
            response['shadow_prediction'] = shadow_preds.tolist()

        logger.info("Prediction finished")
        return jsonify(response)
    except Exception as e:
        logger.exception("Prediction error: %s", e)
        return jsonify({'error': str(e)}), 400


@app.route('/trade', methods=['POST'])
def trade():
    """Endpoint used by the executor to record executed trades."""
    data = request.get_json(force=True)
    pnl = data.get('pnl')
    if pnl is None:
        return jsonify({'error': 'pnl required'}), 400
    record_trade(float(pnl))
    return jsonify({'status': 'ok'})


@app.route('/performance')
def performance():
    """Return 7-day volatility and win rate."""
    days = int(request.args.get('days', 7))
    return jsonify(recent_performance(days))


@app.route('/stats')
def stats():
    """Return aggregate PnL and Sharpe ratio for recorded trades."""
    return jsonify(compute_stats())

if __name__ == '__main__':
    if model is None:
        logger.error('Failed to load model from %s. Exiting.', MODEL_PATH)
        sys.exit(1)

    debug = os.getenv('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=5000, debug=debug)
