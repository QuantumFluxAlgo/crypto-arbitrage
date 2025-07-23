import os
import time
from collections import deque
from threading import Lock
from typing import List, Dict

import numpy as np
import psycopg2

from .logger import logger

DRY_RUN = os.getenv("DRY_RUN", "True").lower() == "true"
LEDGER_CHECK_INTERVAL = int(os.getenv("LEDGER_CHECK_INTERVAL", "300"))
MAX_TRADES = 1000

trades: deque = deque(maxlen=MAX_TRADES)
trades_lock = Lock()

_last_ledger_check = 0.0
_last_ledger_total = 0.0


def get_connection():
    return psycopg2.connect(
        host=os.environ.get("PGHOST", "localhost"),
        port=int(os.environ.get("PGPORT", 5432)),
        dbname=os.environ.get("PGDATABASE", "arbdb"),
        user=os.environ.get("PGUSER", "postgres"),
        password=os.environ.get("PGPASSWORD", ""),
    )


def _fetch_ledger_data(conn) -> tuple[float, List[Dict[str, float]]]:
    with conn.cursor() as cur:
        cur.execute("SELECT SUM(pnl) FROM trades")
        total = cur.fetchone()[0] or 0.0
        cur.execute(
            "SELECT pnl, EXTRACT(EPOCH FROM timestamp) FROM trades ORDER BY id DESC LIMIT %s",
            (MAX_TRADES,),
        )
        rows = cur.fetchall()
    rows.reverse()
    recent = [{"pnl": float(p), "time": float(ts)} for p, ts in rows]
    return float(total), recent


def sync_with_ledger() -> float:
    """Synchronise in-memory trades with the ledger when available."""
    global _last_ledger_check, _last_ledger_total, trades
    now = time.time()
    if now - _last_ledger_check < LEDGER_CHECK_INTERVAL:
        return _last_ledger_total
    try:
        with get_connection() as conn:
            total, recent = _fetch_ledger_data(conn)
    except Exception as exc:  # pragma: no cover - postgres optional
        logger.warning("[LEDGER] Failed to read from Postgres: %s", exc)
        return _last_ledger_total

    with trades_lock:
        mem_total = sum(t["pnl"] for t in trades)
        ledger_recent_total = sum(t["pnl"] for t in recent)
        if abs(mem_total - ledger_recent_total) > 1e-6:
            logger.warning(
                "[LEDGER] PnL discrepancy detected (mem=%.4f ledger=%.4f). Syncing.",
                mem_total,
                ledger_recent_total,
            )
            trades = deque(recent, maxlen=MAX_TRADES)
    _last_ledger_total = total
    _last_ledger_check = now
    return _last_ledger_total


def record_trade(pnl: float, timestamp: float | None = None) -> None:
    if DRY_RUN:
        logger.info("[DRY-RUN MODE] Simulated trade P&L entry: %+0.2f ETH", pnl)
    if timestamp is None:
        timestamp = time.time()
    with trades_lock:
        trades.append({"pnl": pnl, "time": timestamp})


def compute_stats() -> dict:
    ledger_total = sync_with_ledger()
    with trades_lock:
        if not trades:
            return {"pnl": ledger_total, "sharpe": 0.0}
        pnl_array = np.array([t["pnl"] for t in trades], dtype=np.float32)
    pnl = ledger_total + pnl_array.sum()
    if len(pnl_array) < 2:
        sharpe = 0.0
    else:
        std = pnl_array.std(ddof=1)
        sharpe = 0.0 if std == 0 else pnl_array.mean() / std
    return {"pnl": float(pnl), "sharpe": float(sharpe)}


def rolling_pnl(window: int = 50) -> float:
    sync_with_ledger()
    with trades_lock:
        recent = list(trades)[-window:]
    return float(sum(t["pnl"] for t in recent))


def sharpe_ratio(window: int = 50) -> float:
    sync_with_ledger()
    with trades_lock:
        recent = list(trades)[-window:]
    if len(recent) < 2:
        return 0.0
    returns = np.array([t["pnl"] for t in recent], dtype=np.float32)
    mean = returns.mean()
    std = returns.std(ddof=1)
    if std == 0:
        return 0.0
    return float(mean / std * np.sqrt(len(returns)))


def recent_performance(days: int = 7) -> dict:
    sync_with_ledger()
    cutoff = time.time() - days * 86400
    with trades_lock:
        recent = [t for t in trades if t["time"] >= cutoff]
    if not recent:
        return {"volatility": 0.0, "win_rate": 0.0}
    pnls = np.array([t["pnl"] for t in recent], dtype=np.float32)
    vol = float(pnls.std(ddof=1)) if len(pnls) > 1 else 0.0
    win_rate = float((pnls > 0).mean())
    return {"volatility": vol, "win_rate": win_rate}
