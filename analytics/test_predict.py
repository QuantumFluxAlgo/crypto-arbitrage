import json
import pytest

pytest.importorskip("numpy")
pytest.importorskip("tensorflow")

from . import app as analytics_app


class DummyModel:
    def predict(self, features):
        return features


app = analytics_app.app

def setup_module(module):
    analytics_app.model = DummyModel()


def test_predict_returns_valid_shape():
    client = app.test_client()
    payload = {"features": [1.23, 4.56]}
    resp = client.post('/predict', json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, dict)
    assert 'prediction' in data
    result = data['prediction']
    assert isinstance(result, list)
    assert len(result) == 1
    assert isinstance(result[0], list)
    assert len(result[0]) == 2
    assert all(isinstance(x, float) for x in result[0])
