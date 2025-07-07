def test_predict_returns_valid_shape(analytics_app):
    client = analytics_app.app.test_client()
    payload = {"features": [1.23, 4.56]}
    resp = client.post('/predict', json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, dict)
    assert 'prediction' in data
    assert 'shadow_prediction' in data
    result = data['prediction']
    shadow_result = data['shadow_prediction']
    assert isinstance(result, list)
    assert len(result) == 1
    assert isinstance(result[0], list)
    assert len(result[0]) == 2
    assert all(isinstance(x, float) for x in result[0])
    assert isinstance(shadow_result, list)
    assert len(shadow_result) == 1
    assert isinstance(shadow_result[0], list)
    assert len(shadow_result[0]) == 2
    assert all(isinstance(x, float) for x in shadow_result[0])
