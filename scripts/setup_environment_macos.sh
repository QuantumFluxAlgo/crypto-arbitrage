#!/bin/bash
# Install dependencies on macOS for local testing
set -euo pipefail

echo "Installing Homebrew packages..."
brew install node python@3.11 openjdk@17 git gradle

# ensure JDK binaries are on PATH
export PATH="$(brew --prefix)/opt/openjdk@17/bin:$PATH"

echo "Creating Python virtual environment..."
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip

pip install -r requirements.txt
npm install
npm install --prefix api
npm install --prefix dashboard
npm install --prefix feed-aggregator

./executor/gradlew -p executor --quiet --no-daemon help

echo
echo "Environment setup complete."
echo "Activate the virtual environment with: source .venv/bin/activate"
echo "Verify tools via: ./test/verify-env.sh"
echo "Run all tests with: ./test/run-local.sh"
