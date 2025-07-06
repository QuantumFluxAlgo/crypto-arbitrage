#!/usr/bin/env python3
"""export_report.py - Generate PDF report of latest analytics stats

This CLI tool fetches the latest model version metadata and recent PnL
statistics from the local API and analytics services. It then renders a
simple PDF report containing a PnL chart, Sharpe ratio, model version
identifier and a timestamp. The PDF can be used for investor updates or
compliance audits.
"""

import argparse
from datetime import datetime
import json
import urllib.request
from urllib.error import URLError

import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages


API_BASE = "http://localhost:8080/api"
ANALYTICS_BASE = "http://localhost:5000"


def _fetch_json(url: str):
    with urllib.request.urlopen(url, timeout=5) as resp:
        return json.load(resp)


def fetch_model_metadata(api_base: str = API_BASE):
    return _fetch_json(f"{api_base}/model/version")


def fetch_stats(analytics_base: str = ANALYTICS_BASE):
    return _fetch_json(f"{analytics_base}/stats")


def fetch_trades(api_base: str = API_BASE):
    return _fetch_json(f"{api_base}/trades/history")


def generate_pdf(meta: dict, stats: dict, trades: list[dict], output: str) -> None:
    timestamps = [datetime.fromisoformat(t["timestamp"]) for t in trades]
    pnls = [t["PnL"] for t in trades]

    cumulative = []
    total = 0.0
    for p in pnls:
        total += p
        cumulative.append(total)

    plt.figure(figsize=(8, 4))
    plt.plot(timestamps, cumulative, marker="o", linestyle="-")
    plt.title("Cumulative PnL")
    plt.xlabel("Time")
    plt.ylabel("PnL")
    plt.grid(True)
    fig_chart = plt.gcf()

    plt.figure(figsize=(8, 4))
    plt.axis("off")
    lines = [
        f"Version: {meta.get('version_hash', 'N/A')}",
        f"Trained: {meta.get('trained_at', 'N/A')}",
        f"Sharpe: {stats.get('sharpe', 0):.2f}",
        f"Generated: {datetime.utcnow().isoformat()}"
    ]
    for i, line in enumerate(lines):
        plt.text(0.1, 0.9 - i * 0.2, line, fontsize=12)
    fig_info = plt.gcf()

    with PdfPages(output) as pdf:
        pdf.savefig(fig_chart)
        pdf.savefig(fig_info)

    plt.close(fig_chart)
    plt.close(fig_info)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate PDF report of model stats")
    parser.add_argument("-o", "--output", default="report.pdf", help="Output PDF path")
    parser.add_argument("--api-base", default=API_BASE, help="API base URL")
    parser.add_argument("--analytics-base", default=ANALYTICS_BASE, help="Analytics base URL")
    args = parser.parse_args()

    global API_BASE, ANALYTICS_BASE
    API_BASE = args.api_base
    ANALYTICS_BASE = args.analytics_base

    try:
        meta = fetch_model_metadata()
        stats = fetch_stats()
        trades = fetch_trades()
    except URLError as exc:
        raise SystemExit(f"Failed to fetch data: {exc}")

    generate_pdf(meta, stats, trades, args.output)
    print(f"Report written to {args.output}")


if __name__ == "__main__":
    main()
