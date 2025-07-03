import json

from app import app


def test_predict_returns_valid_shape():
    client = app.test_client()
    payload = [1.23, 4.56]
    resp = client.post('/predict', json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert all(isinstance(x, float) for x in data)
