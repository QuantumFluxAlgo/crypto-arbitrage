# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Batch 10] - 2025-07-11

### Added
- Xeon deployment scripts
- Operator CLI toolkit
- Rollback + backup docs
- GitHub release pipeline
- Final changelog + release instructions

## [Batch 9] - 2025-07-10

### Added
- Podman build step in CI
- Trivy scan security checks
- Sentry integration
- StatusCake docs
- SBOM generation
- Static analysis across all services

### Tests
- None

## [Batch 8] - 2025-07-09

### Added
- Kubernetes manifest validation in CI workflow

### Tests
- None

## [Batch 7] - 2025-07-08

### Added
- Panic brake system
- Resume control via Redis
- Email, Telegram, and Webhook alerts
- AlertManager aggregator
- Alert config env template

### Tests
- PanicBrakeTest

## [Batch 6] - 2025-07-07

### Added
- Flask ML microservice with LSTM model
- GPU-enabled prediction API (/predict)
- Prometheus metrics endpoint
- Structured logs
- Synthetic training data
- PyTest for prediction

## [Batch 5] - 2025-07-06
### Added
- ColdSweeper class and sweep trigger logic

### Added
- Mock IOC execution logic
- TradeLogger and PnL tracker
- Cold wallet sweep trigger logic (test wallet)
- Rebalancer skeleton logic

### Tests
- ColdSweeperTest
- RebalancerTest

## [Batch 4] - 2025-07-05

### Added
- Java executor app structure
- Redis feed subscriber
- SpreadOpportunity model
- Risk filter and logger
- PostgreSQL near-miss logging
- Slippage validation

### Tests
- RiskFilterTest

## [Batch 3] - 2025-07-04

### Added
- React SPA scaffold (Vite + Tailwind)
- Login form + auth context
- Route structure for dashboard/settings/analytics
- Settings UI with API integration
- Analytics view with trade history

### Tests
- Login form smoke test

## [Batch 2] - 2025-07-03

### Added
- Containerfiles for all services
- Logging libraries (winston, slf4j, logging)
- .env.example templates
- GitHub CI workflow with test enforcement
- Podman build script

## [Batch 1] - 2025-07-02

### Added
- Local environment setup
- GitHub repo + branching model
- Git pre-push hook
- Test verifier script
- LICENSE and README scaffolds
