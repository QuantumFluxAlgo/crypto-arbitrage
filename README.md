# 🪙 Crypto Arbitrage

A multi-agent, multi-service platform for real-time cryptocurrency arbitrage detection, execution, and monitoring.

![MIT License](https://img.shields.io/badge/license-MIT-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux-blue)

---

## 📈 Overview

**Crypto Arbitrage** is a high-performance system that identifies and executes arbitrage opportunities across multiple centralized exchanges.  
It uses autonomous agents coordinated through **Redis** (pub/sub messaging) and **PostgreSQL** (state persistence), all observable via a real-time dashboard.

---

## ⚙️ Features

Each agent is encapsulated by role, designed for modularity and fault isolation:

| Agent | Description |
|-------|-------------|
| [**Executor Agent**](https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L7-L13) | Java service that detects real-time arbitrage spreads and executes trades atomically. |
| [**API Gateway Agent**](https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L17-L25) | Node.js service exposing RESTful endpoints like `/opportunities`, `/settings`, and `/login`. |
| [**Dashboard Agent**](https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L29-L33) | Mobile-friendly React interface for toggling modes, latency constraints, and loss thresholds. |
| [**Feed Aggregator Agent**](https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L37-L41) | Consolidates exchange price feeds and publishes to Redis in real-time. |
| [**Rebalancer Agent**](https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L45-L50) | Rebalances hot wallets and executes NAV-based sweeps to cold storage. |
| [**Analytics Agent**](https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L54-L58) | Python service running an LSTM model for price spread prediction; exposes Prometheus metrics. |
| [**Alert Agent**](https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L62-L69) | Dispatches notifications for anomalies, drawdowns, mode changes, and agent failures. |
| [**Circuit Breaker Agent**](https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L73-L79) | Shuts down trading activities when defined risk thresholds are exceeded. |
| [**Scheduler Agent**](https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L83-L88) | Orchestrates periodic jobs: rebalancing, metrics aggregation, and historical backups. |
| [**Secret Manager Agent**](https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L92-L95) | Handles encrypted secrets via `kubeseal` and Kubernetes `sealed-secrets`. |

---

## 💻 Requirements

Tested environments:

- macOS 13+ (Monterey or later)
- [Xcode Command Line Tools](https://developer.apple.com/xcode/)
- [`colima`](https://github.com/abiosoft/colima) with `podman` runtime
- Local service dependencies (see agent subdirectories)

---

## 🚀 Dev Setup

To spin up your development environment:

```bash
colima start --runtime podman

