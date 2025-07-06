from pytest import approx
import sys
import types
import math

class _FakeFlask:
    """Very small Flask replacement used for tests."""

    def __init__(self, name):
        self.routes = {}

    def route(self, path, methods=None):
        def decorator(fn):
            self.routes[(path, tuple((methods or ['GET'])))] = fn
            return fn
        return decorator

    def test_client(self):
        flask = self

        class _Client:
            def get(self, url):
                handler = flask.routes.get((url, ('GET',)))
                data = handler()
                return _Response(data)

            def post(self, url, json=None):
                handler = flask.routes.get((url, ('POST',)))
                global request
                request = types.SimpleNamespace(json=json)
                data = handler()
                return _Response(data)

        return _Client()

    def before_request(self, func):
        self._before = func
        return func

    def after_request(self, func):
        self._after = func
        return func


class _Response(dict):
    def __init__(self, data, status=200):
        super().__init__(data)
        self.status_code = status

    def get_json(self):
        return self


def _jsonify(obj=None, **kwargs):
    return obj if obj is not None else kwargs

_fake_flask_module = types.ModuleType("flask")
_fake_flask_module.Flask = _FakeFlask
_fake_flask_module.g = types.SimpleNamespace()
_fake_flask_module.request = types.SimpleNamespace(get_json=lambda force=True: request.json)
_fake_flask_module.jsonify = _jsonify
_fake_flask_module.Response = _Response
sys.modules.setdefault("flask", _fake_flask_module)

_fake_dotenv = types.ModuleType("dotenv")
_fake_dotenv.load_dotenv = lambda: None
sys.modules.setdefault("dotenv", _fake_dotenv)

_prom = types.ModuleType("prometheus_client")
_prom.CollectorRegistry = lambda: None
_prom.Counter = lambda *a, **kw: types.SimpleNamespace(inc=lambda *args: None)
_prom.Histogram = lambda *a, **kw: types.SimpleNamespace(observe=lambda *args: None)
_prom.ProcessCollector = lambda *a, **kw: None
_prom.GCCollector = lambda *a, **kw: None
_prom.generate_latest = lambda reg=None: b""
_prom.CONTENT_TYPE_LATEST = "text/plain"
sys.modules.setdefault("prometheus_client", _prom)

# Provide lightweight stubs so analytics.app can be imported without the real
# heavy dependencies (numpy, tensorflow, joblib).

class _FakeArray(list):
    """Minimal array implementation used by the numpy stub."""

    def sum(self):
        return float(math.fsum(self))

    def mean(self):
        return float(math.fsum(self) / len(self)) if self else 0.0

    def std(self, ddof=0):
        mean = self.mean()
        var = sum((x - mean) ** 2 for x in self) / max(len(self) - ddof, 1)
        return math.sqrt(var)

    def reshape(self, rows, cols):
        if rows == 1:
            return _FakeArray([list(self)])
        raise ValueError("Only reshape(1, -1) supported")

    @property
    def shape(self):
        if self and isinstance(self[0], list):
            return (len(self), len(self[0]))
        return (len(self),)

    def tolist(self):
        return [list(x) if isinstance(x, list) else x for x in self]


def _fake_array(data, dtype=None):
    return _FakeArray(data)


fake_numpy = types.ModuleType("numpy")
fake_numpy.array = _fake_array
fake_numpy.float32 = float
fake_numpy.sqrt = math.sqrt
fake_numpy.isscalar = lambda x: isinstance(x, (int, float))
fake_numpy.bool_ = bool
sys.modules.setdefault("numpy", fake_numpy)

fake_tf = types.ModuleType("tensorflow")
fake_keras = types.ModuleType("tensorflow.keras")
fake_models = types.ModuleType("tensorflow.keras.models")
fake_models.load_model = lambda path: None
fake_keras.models = fake_models
fake_tf.keras = fake_keras
sys.modules.setdefault("tensorflow", fake_tf)
sys.modules.setdefault("tensorflow.keras", fake_keras)
sys.modules.setdefault("tensorflow.keras.models", fake_models)

fake_joblib = types.ModuleType("joblib")
fake_joblib.load = lambda path: None
sys.modules.setdefault("joblib", fake_joblib)

from . import app as analytics_app

app = analytics_app.app


def setup_module(module):
    analytics_app.trades.clear()


def test_stats_endpoint_returns_metrics():
    analytics_app.trades.clear()
    analytics_app.record_trade(1)
    analytics_app.record_trade(-1)
    analytics_app.record_trade(2)

    client = app.test_client()
    resp = client.get('/stats')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['pnl'] == approx(2.0)
    assert data['sharpe'] == approx(0.43643578047, rel=1e-6)
