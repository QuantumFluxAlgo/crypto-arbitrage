#!/usr/bin/env bash
set -eux

# Node.js dependencies
npm install --prefix dashboard
npm install --prefix api
npm install --prefix feed-aggregator

# Python dependencies
pip install -r requirements.txt
pip install -r analytics/requirements.txt

# Java executor tests (Gradle)
chmod +x executor/gradlew
executor/gradlew clean test --console=plain

# Just download Helm chart dependencies (no deployment!)
if command -v helm &> /dev/null; then
  helm dependency update infra/helm
fi

# Prepare environment configs
for d in api dashboard executor analytics; do
  cp "$d"/.env.example "$d"/.env || true
done

# Dummy secrets (for test-mode logic)
export JWT_SECRET="codex_dummy"
export SMTP_USER="codex@example.com"
export SMTP_PASS="codexpass"

