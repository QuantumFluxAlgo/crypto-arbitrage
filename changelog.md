# Changelog

All notable changes to this project will be documented in this file.


The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [Batch 20] - 2025-07-14

### Fixed
- Scheduled cold wallet sweeps according to user-defined cadence

## [Batch 19] - 2025-07-13

### Added
- Auto-switching personality scheduler toggles between Realistic and Aggressive based on analytics stats

## [Batch 18] - 2025-07-12

### Added
- `DB_RETRIES` and `DB_RETRY_DELAY_MS` environment variables for executor DB connection retries
- IOC order execution now measured in microseconds with 60µs rejection threshold

## [Batch 17] - 2025-07-11

### Added
- `sandbox_mode` flag system-wide
- Fake login and fake data flow
- Ghost trade simulator always on
- Dummy Redis, Prometheus, and Postgres endpoints
- Sandbox UI banner and demo startup script

## [Batch 16] - 2025-07-10

### Added
- Ghost mode toggle in system settings
- Redis feed: ghost_feed for simulation
- WebSocket gateway to stream ghost data to UI
- SimulationOverlay component with live charts
- CLI mock script for test ghost trades

### Docs
- README.md section for simulation setup and troubleshooting

## [Batch 15] - 2025-07-09

### Added
- Ensemble scoring engine (rule + model blended)
- Shadow vs prod model evaluator CLI
- Git-based model registry with version hashes
- Full audit logging on model lifecycle
- Alerts on model update
- Static PDF reporting script
- AdminPanel screen with controls and logs

### Docs
- Final README update with AI + ML registry lifecycle

## [Batch 14] - 2025-07-08

### Added
- Feature logging from trade engine to training_features table
- Python export script for ML training data
- Weekly LSTM retrain job via cron
- Model versioning table + API
- Shadow model testing endpoint
- CLI rollback utility for model versions
- Evaluation script to compare predictions between production and shadow models

### Docs
- README.md ML pipeline section

## [Batch 13] - 2025-07-07

### Added
- Admin user management (CRUD + reset password)
- Canary mode toggle in settings
- Trade replay CLI tool for model training
- Postgres backup + restore scripts
- Audit logging for sensitive ops actions

### CLI
- `scripts/replay-trades.js`
- `scripts/backup.sh`, `restore.sh`

## [Batch 12] - 2025-07-06

### Added
- Admin user CRUD routes with hashed passwords
- Change-password and reset-password endpoints
- Canary mode toggle to bypass trade execution
- Trade replay CLI for model testing and auditing
- Audit logger for settings changes and trade replays
- Database backup and restore scripts using pg_dump

### Backend
- Audit middleware registered on settings route
- Auth routes for password management

## [Batch 11] - 2025-07-05

### Added
- Login screen + JWT AuthContext
- Full dashboard layout with equity + trade metrics
- Settings UI with live patching
- Analytics charts and LSTM prediction view
- Infra status dashboard
- Alert configuration form with test buttons

### Backend
- JWT login API
- Settings API controller

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

## [Batch 8] - 2025-07-07

### Added
- `ConfigValidator.java` to enforce runtime safety limits on executor startup
- Unit tests in `ConfigValidatorTest.java` with JUnit 5 coverage
- Auto-fail logic if `LOSS_CAP_PCT > 10`, `LATENCY_MAX_MS > 500`, or `WIN_RATE_THRESHOLD < 0.4`
- Virtualenv setup and `pytest` installation for analytics validation
- Full `verify-env.sh` compatibility and confirmation flow

### Improved
- Executor startup is now hardened against invalid operator configuration
- Prevents high-loss or unsafe latency scenarios from booting the engine

### Verified
- `./verify-env.sh` passed all services (Maven, PyTest, Jest)
- Manual panic + resume cycle tested locally

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
