from pytest import approx
import pytest

pytest.importorskip("numpy")
pytest.importorskip("tensorflow")

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
