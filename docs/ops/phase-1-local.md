# Phase 1: Local Development and Test Setup (Colima + Podman)

**Purpose:**
Spin up the Prism Arbitrage platform locally in simulated mode on a MacBook (M1/M2) using Colima + Podman. This setup avoids real API keys or wallet interactions and allows full testing of core system behavior and safety controls.

---

## 1. Prerequisites: System Preparation (macOS Terminal)

### Install Apple Command Line Tools

```bash
xcode-select --install
```

### Install Homebrew (if not already installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Install Required Software

```bash
brew install git redis postgresql helm kubectl colima podman python node
```

---

## 2. Start Local Kubernetes Environment

### Launch Colima with Kubernetes and containerd runtime

```bash
colima start --with-kubernetes --runtime containerd
```

This initializes a local Kubernetes cluster with Podman-compatible containers. Docker is not required.

---

## 3. Clone the Repository

Authenticate to GitHub if not already done:

```bash
gh auth login
```

Clone the repository and check out the development branch:

```bash
gh repo clone prism-arbitrage/crypto-arbitrage
cd crypto-arbitrage

git checkout develop
```

---

## 4. Create and Configure Environment Files

Each service has its own `.env.example` file. Copy and customize them:

```bash
cp api/.env.example api/.env
cp dashboard/.env.example dashboard/.env
cp executor/.env.example executor/.env
cp analytics/.env.example analytics/.env
```

### Install dashboard dependencies

```bash
cd dashboard
yarn install
cd ..
```

Edit the `.env` files for test-safe operation. Example for `api/.env`:

```env
JWT_SECRET=localtestsecret
SMTP_USER=dummy@example.com
SMTP_PASS=dummypass
ALERT_RECIPIENT=ops@example.com
```

Example for `executor/.env`:

```env
PERSONALITY_MODE=AUTO
LOSS_CAP_PCT=5
LATENCY_MAX_MS=250
```

Exchange API keys can remain as dummy strings. Avoid real credentials.

---

## 5. Build and Start Services

### Make the build script executable

```bash
chmod +x scripts/builds.sh
```

### Build all containers

```bash
./scripts/builds.sh
```

Services included:

* `arb-api` (backend + settings API)
* `arb-dashboard` (React frontend)
* `arb-executor` (Java execution logic)
* `arb-analytics` (Python ML engine)

---

## 6. Start Containers (Optional)

Use Podman to launch containers manually for isolated testing.

Example to run the API:

```bash
podman run -p 8080:8080 --env-file api/.env arb-api
```

Standard ports:

* API: 8080
* Dashboard: 3000
* Analytics: 5000
* Executor: 9000

Start Redis and Postgres if not already running:

```bash
brew services start redis
brew services start postgresql@16
```

---

## 7. Access and Test the Dashboard

Open a browser and visit:

```
http://localhost:3000
```

Log in using credentials from your `.env` file.

Test the following:

* Load dashboard UI
* Change Personality Mode via settings
* Simulate panic state and confirm red banner appears
* Use Resume button to clear panic state
* Confirm changes are reflected in API via curl or logs

---

## 8. Run the Full Test Suite

Make test verifier script executable:

```bash
chmod +x test/run-local.sh
```

Run it:

```bash
./test/run-local.sh
```

This will run:

* Jest tests for `api/` and `dashboard/`
* PyTest for `analytics/`
* Gradle test suite for `executor/`

Tests must pass before pushing to the repository.

---

## 9. Simulate Panic Brake

To simulate a panic condition, use the API or feed in test trade data.

Example: trigger a loss-based panic condition

```bash
curl -X POST http://localhost:8080/api/test/panic --data '{"type":"loss", "value":6}'
```

Dashboard will show a "Trading Paused" banner if successful.

---

## 10. Resume Trading

Click "Resume Trading" on the dashboard or trigger resume via API.

Executor logs should display:

```
[RESUME SIGNAL RECEIVED] Resuming trade evaluation
```

System should resume evaluating opportunities immediately.

---

## 11. Optional: Prometheus and Grafana (Advanced)

Install via Homebrew if needed:

```bash
brew install prometheus grafana
```

Configuration is optional and not required for dashboard/UI testing.

---

## Validation Checklist

* [ ] Services build and run locally via Podman
* [ ] Dashboard loads at `localhost:3000`
* [ ] All tests pass with `run-local.sh`
* [ ] Panic brake triggers and disables trading
* [ ] Resume button restores system state
* [ ] Redis and Postgres function without error
* [ ] No real API keys or secrets are present

