# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Add real-time panic brake and execution mode banner to operator dashboard
- Enforce system health validation before allowing panic resume actions
- Enforced system health check and confirmation step for resume logic (API + executor)
- Secure /resume endpoint with execution-mode-aware admin check

- Downgrade numpy to 2.1.3 to resolve TensorFlow install conflict.
- Store Postgres credentials in sealed secrets
- Added feed-aggregator deployment manifest
- Introduced HorizontalPodAutoscaler resources
- Require SealedSecrets and enforce secret hygiene in CI and deployment templates
- Added profit targets and slippage caps
- Added feed-aggregator deployment
- Integrated sealed secrets
- Fix panic resume and Redis signal behavior in Executor and PanicBrake
- Live config reloads now enforce risk validation (loss %, latency, coin exposure)
- Remove plaintext .env.sandbox file and enforce secret hygiene in CI and gitignore
- Cancel all legs on partial fill to prevent orphaned exposure in SpreadOpportunity
- CVE scanning with Trivy
- Split metrics endpoints by execution mode to support safe observability
- Update documentation and config comments to match final audit-compliant platform behavior
- Rewrite documentation to reflect all audited system behavior and enforce operator clarity

## [Batch 1] - 2025-07-02
### Added
- Local environment setup
- GitHub repo and branching model
- Git pre-push hook
- Test verifier script
- LICENSE and README scaffolds
