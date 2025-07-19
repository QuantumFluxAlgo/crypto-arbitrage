# strategy-modes.md

## Overview

The trading engine supports three personality modes that adjust aggressiveness and position sizing.

| Mode | Net Edge Threshold | Position Size | Notes |
|------|-------------------|--------------|------|
| Realistic | >= 0.5% | Conservative | Prioritizes capital preservation |
| Aggressive | >= 0.2% | Larger | Captures more volatile spreads |
| Auto | 0.2–0.5% dynamic | Variable | Switches based on 7‑day volatility and hit rate |

## Switching Logic

In Auto mode the system evaluates market volatility and win rate every minute. High volatility with a win rate above 50% triggers Aggressive mode. Low volatility or a win rate below 40% reverts to Realistic mode. All mode changes are logged to Postgres.

## Hot Reload

Operators can switch modes from the dashboard settings panel. Updates are applied instantly without restarting services.
