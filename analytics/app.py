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

if __name__ == '__main__':
    debug = os.getenv('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=5000, debug=debug)

