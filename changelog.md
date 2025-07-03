# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
