# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Add real-time panic brake and execution mode banner to operator dashboard
- Enforce system health validation before allowing panic resume actions

- Downgrade numpy to 2.1.3 to resolve TensorFlow install conflict.
- Store Postgres credentials in sealed secrets
- Added feed-aggregator deployment manifest
- Introduced HorizontalPodAutoscaler resources
- Require SealedSecrets and enforce secret hygiene in CI and deployment templates
- Added profit targets and slippage caps
- Added feed-aggregator deployment
- Integrated sealed secrets
- Fix panic resume and Redis signal behavior in Executor and PanicBrake
- CVE scanning with Trivy
- Split metrics endpoints by execution mode to support safe observability
- Update documentation and config comments to match final audit-compliant platform behavior

## [Batch 1] - 2025-07-02
### Added
- Local environment setup
- GitHub repo and branching model
- Git pre-push hook
- Test verifier script
- LICENSE and README scaffolds
