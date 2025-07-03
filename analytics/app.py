import os
import time
import logging
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

# Load environment variables from .env file (if any)
load_dotenv()

# Flask setup
app = Flask(__name__)

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Prometheus setup
registry = CollectorRegistry()
ProcessCollector(registry=registry)
GCCollector(registry=registry)

request_count = Counter('request_count', 'Total HTTP requests', registry=registry)
average_latency = Gauge('average_latency', 'Average request latency in seconds', registry=registry)

_total_latency = 0.0
_total_requests = 0

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

if __name__ == '__main__':
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=5000, debug=debug)

