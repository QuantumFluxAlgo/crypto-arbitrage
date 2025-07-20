#!/usr/bin/env bash
set -eux

# Node.js dependencies
npm install --prefix dashboard
npm install --prefix api
npm install --prefix feed-aggregator

# Python dependencies
pip install -r requirements.txt
pip install -r analytics/requirements.txt

# Java tests (executor)
chmod +x executor/gradlew
executor/gradlew clean test --console=plain

# Helm chart dependencies
helm dependency update infra/helm

# Copy .env config
for d in api dashboard executor analytics; do
  cp "$d"/.env.example "$d"/.env || true
done

# Export dummy secrets
export JWT_SECRET="codex_dummy"
export SMTP_USER="codex@example.com"
export SMTP_PASS="codexpass"

