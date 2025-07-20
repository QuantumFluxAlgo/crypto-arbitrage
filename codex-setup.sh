#!/usr/bin/env bash
set -eux

# Install Node.js dependencies
npm install --prefix dashboard
npm install --prefix api

# Install Python dependencies
pip install -r analytics/requirements.txt

# Build the Java executor (automatically downloads dependencies)
chmod +x executor/mvnw
executor/mvnw clean install

# Copy example .env files to actual .env files
cp api/.env.example api/.env || true
cp dashboard/.env.example dashboard/.env || true
cp executor/.env.example executor/.env || true
cp analytics/.env.example analytics/.env || true

# Export basic environment variables (Codex reads them)
export JWT_SECRET="codex_dummy"
export SMTP_USER="codex@example.com"
export SMTP_PASS="codexpass"

