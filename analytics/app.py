import os
import time
import logging

import numpy as np
from flask import Flask, g, request, jsonify, Response
from dotenv import load_dotenv
from prometheus_client import (
    CollectorRegistry,
    Counter,
    Gauge,
    ProcessCollector,
    GCCollector,
    generate_latest,
    CONTENT_TYPE_LATEST,
)

from tensorflow.keras.models import load_model as load_keras_model
import joblib

# Load .env variables
load_dotenv()

# Configure Flask
app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# Prometheus metrics setup
registry = CollectorRegistry()
ProcessCollector(registry=registry)
GCCollector(registry=registry)

request_count = Counter('request_count', 'Total HTTP requests', registry=registry)
average_latency = Gauge('average_latency', 'Average request latency in seconds', registry=registry)

_total_latency = 0.0
_total_requests = 0

# In-memory trade store
trades = []


def record_trade(pnl):
    """Record a trade's PnL in memory, keeping at most 1000 entries."""
    trades.append({'pnl': pnl, 'timestamp': time.time()})
    if len(trades) > 1000:
        trades.pop(0)


def compute_stats():
    """Compute aggregate PnL and Sharpe ratio for all stored trades."""
    if not trades:
        return {'pnl': 0, 'sharpe': 0}
    pnl_array = np.array([t['pnl'] for t in trades])
    pnl = pnl_array.sum()
    if pnl_array.std() == 0:
        sharpe = 0
    else:
        sharpe = pnl_array.mean() / pnl_array.std() * np.sqrt(len(pnl_array))
    return {'pnl': float(pnl), 'sharpe': float(sharpe)}


def rolling_pnl(window: int = 50) -> float:
    """Return the rolling P&L for the last `window` trades."""
    recent = trades[-window:]
    return float(sum(t['pnl'] for t in recent))


def sharpe_ratio(window: int = 50) -> float:
    """Compute the Sharpe ratio for the last `window` trades."""
    recent = trades[-window:]
    if not recent:
        return 0.0
    returns = np.array([t['pnl'] for t in recent], dtype=np.float32)
    mean = returns.mean()
    std = returns.std()
    if std == 0:
        return 0.0
    return float(mean / std * np.sqrt(len(returns)))

# Load model
MODEL_PATH = os.getenv("MODEL_PATH", "model.h5")

def load_model(path: str):
    logger.info("Attempting to load model from %s", path)
    try:
        if path.endswith(".h5"):
            model = load_keras_model(path)
        elif path.endswith(".joblib"):
            model = joblib.load(path)
        else:
            raise ValueError(f"Unsupported model format: {path}")
        logger.info("Model loaded successfully")
        return model
    except Exception as e:
        logger.exception("Model loading failed: %s", e)
        return None

model = load_model(MODEL_PATH)

@app.before_request
def before_request():
    g.start_time = time.time()
    logger.info(f"{request.method} {request.path}")

@app.after_request
def after_request(response):
    global _total_latency, _total_requests
    latency = time.time() - g.start_time
    _total_latency += latency
    _total_requests += 1
    request_count.inc()
    average_latency.set(_total_latency / _total_requests)
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

        logger.info("Input shape: %s", features.shape)
        preds = model.predict(features)
        logger.info("Output shape: %s", np.array(preds).shape)
        return jsonify({'prediction': preds.tolist()})
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


@app.route('/stats')
def stats():
    """Return aggregate PnL and Sharpe ratio for recorded trades."""
    return jsonify(compute_stats())

if __name__ == '__main__':
    debug = os.getenv('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=5000, debug=debug)

