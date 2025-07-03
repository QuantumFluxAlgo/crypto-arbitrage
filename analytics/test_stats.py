from pytest import approx
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
    resp = client.get('/stats?window=3')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['rolling_pnl'] == approx(2.0)
    assert data['sharpe_ratio'] == approx(0.92582009977, rel=1e-6)
    assert data['window'] == 3
