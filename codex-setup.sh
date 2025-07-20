#!/usr/bin/env bash
set -eux

# Node.js dependencies
npm install --prefix dashboard
npm install --prefix api
npm install --prefix feed-aggregator

# Python dependencies
pip install -r requirements.txt
pip install -r analytics/requirements.txt

# Java executor tests (correct directory!)
cd executor
chmod +x gradlew
./gradlew clean test --console=plain
cd ..

# Helm chart dependencies (only fetches charts, doesn't deploy)
if command -v helm &> /dev/null; then
  helm dependency update infra/helm
fi

# Prepare .env configs
for d in api dashboard executor analytics; do
  cp "$d"/.env.example "$d"/.env || true
done

# Export dummy values to prevent crashes
export JWT_SECRET="codex_dummy"
export SMTP_USER="codex@example.com"
export SMTP_PASS="codexpass"

