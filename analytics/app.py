# Flask analytics service exposing model predictions and metrics
import os
import sys
import time
from .logger import logger
from collections import deque
import threading
import subprocess

import numpy as np
from flask import Flask, g, request, jsonify, Response
from dotenv import load_dotenv
from prometheus_client import (
    CollectorRegistry,
    Counter,
    Histogram,
    Gauge,
    ProcessCollector,
    GCCollector,
    generate_latest,
    CONTENT_TYPE_LATEST,
)

from tensorflow.keras.models import load_model as load_keras_model
import tensorflow as tf
import joblib
import redis

# Load .env variables
load_dotenv()

# Redis connection setup
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    info = redis_client.connection_pool.connection_kwargs
    host = info.get("host", "localhost")
    port = info.get("port", 6379)
    logger.info("[REDIS] Connected to %s:%s via REDIS_URL", host, port)
except Exception as exc:
    redis_client = None
    logger.error("[REDIS] Invalid REDIS_URL: %s", exc)

# Detect GPU for optional acceleration
logger.info("Analytics app starting")


def detect_gpu() -> bool:
    """Return True if a Tesla P4 GPU is detected."""
    # Try torch.cuda first if torch is installed
    try:
        import torch

        if torch.cuda.is_available():
            try:
                name = torch.cuda.get_device_name(0)
            except Exception:  # pragma: no cover - unexpected torch failure
                name = ""
            if name and "Tesla P4" in name:
                return True
            # torch sees a GPU but not Tesla P4
            return False
    except Exception:
        pass

    # Fallback to nvidia-smi
    try:
        proc = subprocess.run(
            [
                "nvidia-smi",
                "--query-gpu=name",
                "--format=csv,noheader",
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode == 0:
            for line in proc.stdout.splitlines():
                if "Tesla P4" in line:
                    return True
    except Exception:
        pass
    return False


GPU_AVAILABLE = detect_gpu()

def get_gpu_memory() -> tuple[int, int]:
    """Return total and used GPU memory in bytes."""
    proc = subprocess.run(
        [
            "nvidia-smi",
            "--query-gpu=memory.total,memory.used",
            "--format=csv,noheader,nounits",
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError("nvidia-smi failed")
    line = proc.stdout.strip().splitlines()[0]
    total_str, used_str = [x.strip() for x in line.split(",")]
    return int(total_str) * 1024 * 1024, int(used_str) * 1024 * 1024

# Configure Flask
app = Flask(__name__)

# logger imported from centralized module

# Prometheus metrics setup
registry = CollectorRegistry()
ProcessCollector(registry=registry)
GCCollector(registry=registry)

request_count_total = Counter('request_count_total', 'Total HTTP requests', registry=registry)
request_latency_ms = Histogram(
    'request_latency_ms',
    'Request latency in milliseconds',
    registry=registry,
)
inference_latency_ms = Histogram(
    'inference_latency_ms',
    'Model inference latency in milliseconds',
    registry=registry,
)

# Panic/resume state and daily loss percentage
panic_triggered = Gauge('panic_triggered', '1 if panic activated', registry=registry)
resume_signal = Gauge('resume_signal', '1 when resume issued', registry=registry)
daily_loss_pct = Gauge('daily_loss_pct', 'Daily loss percentage', registry=registry)
panic_triggered.set(0)
resume_signal.set(0)
daily_loss_pct.set(0)

pnl_gauge = Gauge('total_pnl', 'Total profit and loss', registry=registry)
sharpe_gauge = Gauge('sharpe_ratio', 'Strategy Sharpe ratio', registry=registry)
hit_rate_gauge = Gauge('hit_rate', 'Overall trade hit rate', registry=registry)
win_rate_pct_gauge = Gauge('win_rate_pct', 'Strategy win rate percentage', registry=registry)
gpu_status_gauge = Gauge('gpu_available', '1 if Tesla P4 GPU detected', registry=registry)
lstm_status_gauge = Gauge('lstm_enabled', '1 if LSTM model enabled', registry=registry)

if GPU_AVAILABLE:
    gpu_mem_total_gauge = Gauge('gpu_memory_total_bytes', 'Total GPU memory in bytes', registry=registry)
    gpu_mem_used_gauge = Gauge('gpu_memory_used_bytes', 'Used GPU memory in bytes', registry=registry)

pnl_gauge.set(0)
sharpe_gauge.set(0)
hit_rate_gauge.set(0)
win_rate_pct_gauge.set(0)
gpu_status_gauge.set(1 if GPU_AVAILABLE else 0)
lstm_status_gauge.set(0)
if GPU_AVAILABLE:
    gpu_mem_total_gauge.set(0)
    gpu_mem_used_gauge.set(0)

# In-memory trade store
MAX_TRADES = 1000
trades = deque(maxlen=MAX_TRADES)
trades_lock = threading.Lock()


def record_trade(pnl: float, timestamp: float | None = None) -> None:
    """Record a trade's PnL in memory using a fixed-size deque."""
    if timestamp is None:
        timestamp = time.time()
    with trades_lock:
        trades.append({"pnl": pnl, "time": timestamp})


def compute_stats():
    """Compute aggregate PnL and Sharpe ratio for all stored trades."""
    with trades_lock:
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
    with trades_lock:
        recent = list(trades)[-window:]
    return float(sum(t["pnl"] for t in recent))


def sharpe_ratio(window: int = 50) -> float:
    """Compute the Sharpe ratio for the last `window` trades."""
    with trades_lock:
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
    with trades_lock:
        recent = [t for t in trades if t["time"] >= cutoff]
    if not recent:
        return {"volatility": 0.0, "win_rate": 0.0}

    pnls = np.array([t["pnl"] for t in recent], dtype=np.float32)
    vol = float(pnls.std(ddof=1)) if len(pnls) > 1 else 0.0
    win_rate = float((pnls > 0).mean())
    return {"volatility": vol, "win_rate": win_rate}

# Load model
# MODEL_PATH env allows swapping models without rebuilds
MODEL_PATH = os.getenv("MODEL_PATH", "model.h5")
SHADOW_MODEL_PATH = os.getenv("MODEL_SHADOW_PATH", "model_shadow.h5")
LSTM_CONFIG_ENABLED = os.getenv("LSTM_ENABLED", "1").lower() not in {"0", "false", "no"}

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

LSTM_ENABLED = LSTM_CONFIG_ENABLED and model is not None
logger.info("[METRICS] GPU detected: %s | LSTM enabled: %s", GPU_AVAILABLE, LSTM_ENABLED)
lstm_status_gauge.set(1 if LSTM_ENABLED else 0)

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
    latency_ms = (time.time() - g.start_time) * 1000
    request_count_total.inc()
    request_latency_ms.observe(latency_ms)
    return response

@app.route('/')
def index():
    return 'Hello, World!'

@app.route('/ping')
def ping():
    return jsonify(pong=True)

@app.route('/metrics')
def metrics():
    try:
        stats = compute_stats()
        pnl_gauge.set(stats["pnl"])
        sharpe_gauge.set(stats["sharpe"])
        perf = recent_performance()
        hit_rate_gauge.set(perf["win_rate"])
        win_rate_pct_gauge.set(perf["win_rate"] * 100)
    except Exception as exc:
        logger.exception("[METRICS] Stat calculation failed: %s", exc)

    gpu_status_gauge.set(1 if GPU_AVAILABLE else 0)
    lstm_status_gauge.set(1 if LSTM_ENABLED else 0)

    if GPU_AVAILABLE:
        try:
            total, used = get_gpu_memory()
            gpu_mem_total_gauge.set(total)
            gpu_mem_used_gauge.set(used)
        except Exception as exc:
            logger.warning("[METRICS] GPU memory query failed: %s", exc)

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
        duration_ms = (time.time() - start_inf) * 1000
        inference_latency_ms.observe(duration_ms)
        logger.info("Output shape: %s", np.array(preds).shape)
        logger.info("Inference took %.2f ms", duration_ms)

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
