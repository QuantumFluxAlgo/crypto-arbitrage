import os
import time
import logging

import numpy as np
from flask import Flask, g, request, jsonify, Response
from dotenv import load_dotenv
from tensorflow.keras.models import load_model
from prometheus_client import (
    CollectorRegistry,
    Counter,
    Gauge,
    ProcessCollector,
    GCCollector,
    generate_latest,
    CONTENT_TYPE_LATEST,
)

# Load .env file
load_dotenv()

# Setup Flask
app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Prometheus metrics setup
registry = CollectorRegistry()
ProcessCollector(registry=registry)
GCCollector(registry=registry)

request_count = Counter('request_count', 'Total HTTP requests', registry=registry)
average_latency = Gauge('average_latency', 'Average request latency in seconds', registry=registry)

_total_latency = 0.0
_total_requests = 0

# Load ML model
MODEL_PATH = "model.h5"
try:
    model = load_model(MODEL_PATH)
    logger.info("Loaded model from %s", MODEL_PATH)
except Exception as e:
    logger.exception("Failed to load model from %s: %s", MODEL_PATH, e)
    model = None

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
    """Return model predictions for array of spreads."""
    if model is None:
        return jsonify({'error': 'model not loaded'}), 500

    start_time = time.time()
    try:
        data = request.get_json(force=True)
        spreads = np.asarray(data, dtype=np.float32)
        logger.info("Input shape: %s", spreads.shape)
        preds = model.predict(spreads)
        elapsed = time.time() - start_time
        logger.info("Output shape: %s, time: %.4fs", preds.shape, elapsed)
        return jsonify(preds.tolist())
    except Exception as e:
        logger.exception("Prediction failed: %s", e)
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=5000, debug=debug)

