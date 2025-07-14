#!/bin/bash
# scripts/setup_env.sh
# Install dependencies so that ./test/run-local.sh can run.

set -euo pipefail

echo "Updating package list..."
sudo apt-get update

echo "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing Python 3.10 and virtualenv tools..."
sudo apt-get install -y python3.10 python3.10-venv python3-pip

echo "Installing OpenJDK 17 and build tools..."
sudo apt-get install -y openjdk-17-jdk git build-essential

echo "Creating Python virtual environment..."
python3.10 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip

echo "Installing Python packages..."
pip install -r requirements.txt

echo "Installing root Node modules..."
npm install

echo "Installing Node modules for sub-services..."
npm install --prefix api
npm install --prefix dashboard
npm install --prefix feed-aggregator

echo "Prefetching Gradle wrapper dependencies..."
./executor/gradlew -p executor --quiet --no-daemon help

echo
echo \"Environment setup complete.\"
echo \"Activate the virtual environment with: source .venv/bin/activate\"
echo \"Verify tools via: ./test/verify-env.sh\"
echo \"Run all tests with: ./test/run-local.sh\"

