#!/bin/bash
# Install dependencies on macOS for local testing
set -euo pipefail

# ensure any previously activated venv doesn't interfere
if [ -n "${VIRTUAL_ENV:-}" ]; then
  deactivate || true
fi

# remove stale virtual environment if it exists
if [ -d ".venv" ]; then
  echo "Removing existing virtual environment..."
  rm -rf .venv
fi

echo "Installing Homebrew packages..."
brew install node python@3.11 openjdk@17 git gradle

# ensure JDK binaries are on PATH
export PATH="$(brew --prefix)/opt/openjdk@17/bin:$PATH"

echo "Creating Python virtual environment..."
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

python -m pip install -r requirements.txt
npm install
npm install --prefix api
npm install --prefix dashboard
npm install --prefix feed-aggregator

if ! jar tf executor/gradle/wrapper/gradle-wrapper.jar >/dev/null 2>&1; then
  echo "Gradle wrapper missing or corrupt; regenerating..."
  (cd executor && gradle wrapper --no-daemon)
fi
./executor/gradlew -p executor --quiet --no-daemon help

echo
echo "Environment setup complete."
echo "Activate the virtual environment with: source .venv/bin/activate"
echo "Verify tools via: ./test/verify-env.sh"
echo "Run all tests with: ./test/run-local.sh"
