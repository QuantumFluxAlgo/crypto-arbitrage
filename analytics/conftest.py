import sys
import types
import pytest

class DummyModel:
    def predict(self, features):
        try:
            import numpy as np
        except Exception:
            return features
        return np.array(features)

@pytest.fixture
def analytics_app(monkeypatch):
    tf = types.ModuleType("tensorflow")
    keras = types.ModuleType("tensorflow.keras")
    models = types.ModuleType("tensorflow.keras.models")
    models.load_model = lambda path: DummyModel()
    keras.models = models
    tf.keras = keras
    monkeypatch.setitem(sys.modules, "tensorflow", tf)
    monkeypatch.setitem(sys.modules, "tensorflow.keras", keras)
    monkeypatch.setitem(sys.modules, "tensorflow.keras.models", models)

    dotenv_module = types.ModuleType("dotenv")
    dotenv_module.load_dotenv = lambda: None
    monkeypatch.setitem(sys.modules, "dotenv", dotenv_module)

    prom = types.ModuleType("prometheus_client")
    prom.CollectorRegistry = lambda: None
    prom.Counter = lambda *a, **kw: types.SimpleNamespace(inc=lambda *args: None)
    prom.Histogram = lambda *a, **kw: types.SimpleNamespace(observe=lambda *args: None)
    prom.ProcessCollector = lambda *a, **kw: None
    prom.GCCollector = lambda *a, **kw: None
    prom.generate_latest = lambda reg=None: b""
    prom.CONTENT_TYPE_LATEST = "text/plain"
    monkeypatch.setitem(sys.modules, "prometheus_client", prom)

    try:
        import werkzeug
    except Exception:
        werkzeug = types.ModuleType("werkzeug")
        monkeypatch.setitem(sys.modules, "werkzeug", werkzeug)
    if not hasattr(werkzeug, "__version__"):
        monkeypatch.setattr(werkzeug, "__version__", "0.0", raising=False)

    joblib_module = types.ModuleType("joblib")
    joblib_module.load = lambda path: DummyModel()
    monkeypatch.setitem(sys.modules, "joblib", joblib_module)

    from importlib import reload
    from analytics import app as analytics_app
    reload(analytics_app)

    analytics_app.model = DummyModel()
    analytics_app.shadow_model = DummyModel()
    yield analytics_app
