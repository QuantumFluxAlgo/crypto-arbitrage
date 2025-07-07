from pytest import approx

def test_stats_endpoint_returns_metrics(analytics_app):
    analytics_app.trades.clear()
    analytics_app.record_trade(1)
    analytics_app.record_trade(-1)
    analytics_app.record_trade(2)

    client = analytics_app.app.test_client()
    resp = client.get('/stats')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['pnl'] == approx(2.0)
    assert data['sharpe'] == approx(0.43643578047, rel=1e-6)


def test_performance_endpoint_returns_metrics(analytics_app, monkeypatch):
    analytics_app.trades.clear()
    now = 1_000_000.0
    monkeypatch.setattr(analytics_app.time, "time", lambda: now)
    analytics_app.record_trade(1, now - 3 * 86400)
    analytics_app.record_trade(-1, now - 2 * 86400)
    analytics_app.record_trade(2, now)

    client = analytics_app.app.test_client()
    resp = client.get('/performance')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'volatility' in data
    assert 'win_rate' in data
    assert data['win_rate'] == approx(2/3)
