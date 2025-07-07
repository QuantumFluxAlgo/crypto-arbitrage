Complete Guide: Crypto-Arbitrage application by Prism Arbitrage.

Section 1: System Overview
 Includes:
1.1 Platform Summary
1.2 System Architecture
1.3 Interaction Flow
1.4 System Diagram
Section 2: Setup Requirements
 Includes:
2.1 Server Requirements
2.2 Developer Environment
2.3 Software Dependencies
2.4 Package Installation Steps
Section 3: Local Development Guide
 Includes:
3.1 Project Cloning
3.2 Folder Structure Overview
3.3 Running Services Locally
3.4 Running Tests Locally
Section 4: Deployment Guide (Production)
 Includes:
4.1 Server Preparation
4.2 Kubernetes Setup
4.3 Secret Management
4.4 Helm Deployment
4.5 GPU Plugin Deployment
Section 5: UI Dashboard
 Includes:
5.1 Logging In
5.2 Resume Button
5.3 Settings Panel
5.5 Mobile Experience
Section 6: Personality Modes
 Includes:
6.1 Personality Modes Overview
6.2 Net Edge Thresholds
6.4 Hot-Reload Behavior
Section 7: Strategy Engine
 Includes:
7.1 Opportunity Detection
7.2 Triangular Arbitrage
7.3 IOC Order Execution
7.4 Execution Latency Targets
7.5 Slippage and PnL Check
Section 8: Opportunity Filters
 Includes:
8.1 RiskFilter Logic
8.2 Threshold Configuration
8.3 Logging Rejected Trades
8.4 PostgreSQL Schema
Section 9: Panic Brakes & Safety
 Includes:
9.1 Panic Brake Triggers
9.2 Circuit Breaker Logic
9.3 Resume Flow via Redis
9.4 Alert Flow on Panic
10.1 SMTP Alerts
10.2 Telegram Alerts
10.3 Webhook Alerts
10.4 AlertManager Module
Section 11: Rebalancer
 Includes:
11.1 Rebalance Frequency
11.2 Target Distribution Logic
11.3 Dry Run and Logging
Section 12: Cold Wallet Sweeps
 Includes:
12.1 Sweep Logic
12.2 Sweep Cadence Configuration
12.3 Cold Wallet Integration
Section 13: Trade Logging & PnL
 Includes:
13.1 TradeLogger Schema
13.2 PnL Calculation
13.3 ProfitTracker Logic
13.4 Trade Visibility
Section 14: Analytics Engine
 Includes:
14.1 Analytics Metrics
14.2 LSTM Model Architecture
14.3 Training Pipeline
14.4 Inference Pipeline
14.5 GPU Acceleration
14.6 Prometheus Metrics
14.7 Future Roadmap
Section 15: Prometheus & Monitoring
 Includes:
15.1 Executor Metrics
15.2 Analytics Metrics to Grafana
15.3 Alert Thresholds
Section 16: CI/CD Pipeline
 Includes:
16.1 CI Test Flow
16.2 SBOM Generation
16.3 Security Scanning
16.4 Static Analysis
16.5 Release Tagging
Section 17: Secrets Management
 Includes:
17.1 Secret Injection
17.2 Encryption Flow
17.3 Secret Rotation
Section 18: API Gateway
 Includes:
18.1 /login Endpoint
18.2 /settings Endpoint
18.3 /opportunities Endpoint
18.4 /metrics Endpoint
Section 19: Storage System
 Includes:
19.1 Redis Use Cases
19.2 PostgreSQL Schema
19.3 Prometheus Data Model
Section 20: Extensibility Hooks
 Includes:
20.1 Strategy Plug-ins
20.2 Custom Alert Channels
20.3 Liquidity-Aware Routing
Section 21: Security & Compliance
 Includes:
21.1 TLS and Endpoint Protection
21.2 AML + CGT Compliance
21.3 Risk Reduction Features
Section 22: Operator Playbook
 Includes:
22.1 Daily Checklist
22.2 Manual Resume from Panic
22.3 Safe Config Updates
Section 23: Troubleshooting & Recovery
 Includes:
23.1 Helm Rollback
23.2 DB Backup and Restore
23.3 Debugging Panic
Section 24: Release Management
 Includes:
24.1 Release Workflow
24.2 SBOM Uploads
24.3 Production Checklist
Section 25: Glossary of Terms


Section 1: System Overview
 Includes:
1.1 Platform Summary


1.2 System Architecture


1.3 Interaction Flow


1.4 System Diagram (Mermaid + placeholder)



1.1 Platform Summary
Prism Arbitrage is a high-performance, containerized crypto-arbitrage system deployed on-premises. It is designed to identify and exploit price differences across centralized exchanges (CEX) and decentralized exchanges (DEX) in real time.
Key goals:
Automate spread and triangular arbitrage trades with ultra-low latency


Provide live metrics, operator controls, and alerting from a single dashboard


Minimize downside risk through layered panic brakes and exposure caps


Log all trades and failed opportunities to a durable audit trail


Securely protect profits by sweeping them to cold storage wallets


Allow future extension via modular APIs and machine learning analytics


The platform is built with a multi-language stack (Java, Node.js, Python) and can be operated via a mobile-responsive dashboard interface. Operators can toggle risk modes, receive alerts, and pause/resume execution on demand without touching the underlying infrastructure.

1.2 System Architecture
Prism Arbitrage is structured as a set of isolated services, each deployed in containers and orchestrated by Kubernetes on a hardened Ubuntu server.
Core Components:
API Gateway (Fastify): Serves as the REST interface, authentication layer, and static asset host for the dashboard.


Executor Engine (Java): Handles trade opportunity filtering, slippage checks, execution, logging, and P&L tracking.


Analytics Engine (Python): Provides metrics, performs ML-based spread scoring, and exports Prometheus data.


Dashboard (React): Front-end interface for operators to control and observe the system in real time.


PostgreSQL: Stores trades, settings, and near-miss logs.


Redis: Acts as a pub/sub channel for spreads and control signals (e.g. resume from panic).


Prometheus + Grafana: Metric collection and visualization.


Alert Stack: Sends alerts via Gmail SMTP, Telegram bot, and optional webhooks.


Each service runs in its own container, and all secrets are managed via Kubernetes SealedSecrets.

1.3 Interaction Flow
Market Data Ingestion:
 CEX/DEX adapters stream real-time bid/ask data into the system via WebSockets.


Spread Detection:
 The executor analyzes pricing discrepancies between venues or across token paths on a single venue (triangular).


Opportunity Filtering:
 Risk filters check latency and net edge thresholds. Rejected trades are logged. Valid opportunities are passed to the execution engine.


Execution & Logging:
 Immediate-or-Cancel (IOC) orders are placed. Successful trades are logged into Postgres and tracked for profit.


Profit Handling:
 Profits are compared to cold sweep thresholds (e.g. £5,000 or 30% of capital) and swept if eligible.


Monitoring:
 Prometheus collects metrics from executor and analytics services. Grafana visualizes performance data.


Alerting:
 When circuit breakers are triggered (e.g. daily loss %, win rate, latency), alerts are dispatched via email/Telegram/webhook.


Operator Intervention:
 Operator may pause/resume trading via dashboard controls, adjust risk parameters, or monitor trade/equity activity from any browser.



1.4 System Diagram
Diagram Placeholder: Full System Architecture
Insert a system diagram showing:
Inbound Feeds: CEX/DEX Adapters


Core Pipeline: Redis pub/sub → Executor → PostgreSQL + ProfitTracker


Parallel Path: Spread Feed → RiskFilter → Trade Execution


Cold Storage: Trigger to ColdSweeper


Operator UI: Dashboard ← API Gateway ← Redis + Prometheus


Alert Stack: AlertManager → Gmail/Telegram/Webhooks


Analytics Branch: Raw spreads → LSTM Model → Predict → Prometheus Metrics



Insert Mermaid Diagram Block (for future rendering in documentation systems):
lua
CopyEdit
graph TD
    Feed[CEX/DEX Feeds] -->|Spreads| RedisPub
    RedisPub --> Executor
    Executor -->|Trades| Postgres
    Executor -->|PnL| ProfitTracker
    ProfitTracker -->|Trigger| ColdSweeper
    Executor -->|Metrics| Prometheus
    Analytics -->|LSTM Prediction| Prometheus
    API -->|Serves| Dashboard
    API -->|Dispatch| AlertManager
    AlertManager --> Email
    AlertManager --> Telegram
    AlertManager --> Webhooks
    Dashboard -->|Config Updates| API


Section 2: Setup Requirements
 Includes:
2.1 Server Requirements


2.2 Developer Environment


2.3 Software Dependencies


2.4 Package Installation Steps



2.1 Server Requirements
For stable and performant deployment, Prism Arbitrage should be run on an enterprise-grade server with the following specifications:
CPU: Dual Intel Xeon 4210 (10 cores / 20 threads each)


Total Cores/Threads: 20 cores / 40 threads


RAM: 96 GB RDIMM


Primary Storage: 2 × 800 GB SAS SSD (for containers and DB)


Secondary Storage: 6 × 300 GB SAS HDD (optional: archive/logs)


GPU: Nvidia Tesla P4


Network Interface: Broadcom dual-port 10GbE SFP


Operating System: Ubuntu 22.04 LTS or later


Kubernetes Runtime: containerd (with kubeadm setup)


GPU Driver: NVIDIA Data Center Driver compatible with Tesla P4


This configuration supports high-frequency execution, cold storage wallet triggers, and real-time analytics using GPU acceleration.

2.2 Developer Environment
To develop or test Prism Arbitrage locally (on macOS), the following setup is recommended:
Machine: Apple Silicon (M1 or M2) MacBook Air or Pro


macOS Version: macOS 15.3.1 or later


Package Manager: Homebrew


Virtualization Stack:


Colima (for lightweight container orchestration)


Podman (for container management)


Orchestration & Build Tools:


Helm (for K8s manifests)


kubectl (to interface with the cluster)


Languages & Frameworks:


Node.js (v18+)


Python (v3.10+)


Java (OpenJDK 17+)


Databases:


PostgreSQL 16


Redis (latest stable)


Optional but recommended:
GitHub CLI (gh)


JetBrains IDEs or VS Code for editing


Postman or Insomnia for API testing



2.3 Software Dependencies
Below is a list of required core services and tools with version guidance:
Service / Tool
Purpose
Recommended Version
Node.js
Fastify API & Dashboard build
v18.x
Python
Analytics engine (ML & API)
v3.10
Java (JDK)
Executor & trading logic
OpenJDK 17
PostgreSQL
Trade logs, config, analytics
v16
Redis
Spread-feed pub/sub, resume flag
latest stable
Prometheus
Metrics ingestion
v2.45+
Grafana
Metrics visualization
v10+
Helm
K8s deployment via templates
v3.12+
Podman
Docker-compatible container engine
v5+
Colima
Local K8s cluster with containerd
latest
NVIDIA GPU driver
Enable TensorFlow GPU ops
Data Center 535+

Ensure each component is installed and configured before attempting to deploy containers or Helm charts.

2.4 Package Installation Steps
Below is a step-by-step guide to install the required packages on a macOS development machine (Apple Silicon):
Install Command Line Tools

 lua
CopyEdit
xcode-select --install


Install Homebrew

 bash
CopyEdit
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"


Install Core Packages

 nginx
CopyEdit
brew install git redis postgresql helm kubectl colima podman python node


Start Colima with Kubernetes Support

 css
CopyEdit
colima start --with-kubernetes --runtime containerd


Verify Podman Socket

 nginx
CopyEdit
podman info


Install Python Virtual Environment (Optional)

 bash
CopyEdit
python3 -m venv venv
source venv/bin/activate


Install TensorFlow & Prometheus Client (inside Python venv)

 nginx
CopyEdit
pip install tensorflow prometheus_client python-dotenv flask


Install Java & Maven (if needed)

 css
CopyEdit
brew install openjdk@17 maven


Add Node.js Packages for Dashboard

 nginx
CopyEdit
npm install -g yarn



Note:
 Docker is not required. Podman with Colima offers native Apple Silicon compatibility and avoids license issues.


Section 3: Local Development Guide
 Includes:
3.1 Project Cloning


3.2 Folder Structure Overview


3.3 Running Services Locally


3.4 Running Tests Locally



3.1 Project Cloning
To begin working with Prism Arbitrage locally, follow these steps to clone the project using the GitHub CLI:
Authenticate GitHub CLI

 nginx
CopyEdit
gh auth login


Create and Clone the Repository

 bash
CopyEdit
gh repo clone prism-arbitrage/crypto-arbitrage
cd crypto-arbitrage


Switch to Development Branch

 nginx
CopyEdit
git checkout develop


List Available Branches

 css
CopyEdit
git branch -a


You should now have the full source code and branching model locally available.

3.2 Folder Structure Overview
The project is organized by functional modules, aligned with the service-based architecture. Below is a high-level overview of key folders:
Folder
Purpose
/api/
Fastify-based Node.js REST API that controls settings, login, alerts
/dashboard/
React frontend built with Vite and Tailwind, served by API
/executor/
Java-based execution engine handling filtering and trading
/analytics/
Python microservice for ML model inference and Prometheus metrics
/infra/k8s/
Kubernetes manifests per service
/infra/helm/
Helm chart templates for full deployment
/test/
Verifier scripts and test runners
/docs/
Markdown guides for deployment, monitoring, compliance, etc.
.github/
GitHub Actions CI/CD workflows
.gitignore
Project exclusions
README.md
Project overview

Each major service is self-contained and includes its own Dockerfile, .env.example, and CI steps.

3.3 Running Services Locally
Local containers are run via Podman using colima as the backend engine. Here's how to bring up services for testing:
Start Colima

 css
CopyEdit
colima start --with-kubernetes --runtime containerd


Build All Services
 Run the unified build script (ensure it’s executable):

 bash
CopyEdit
chmod +x scripts/build.sh
./scripts/build.sh
 This will build:


arb-api


arb-dashboard


arb-executor


arb-analytics


Run Containers Individually
 Example (API service):

 arduino
CopyEdit
podman run -p 8080:8080 --env-file api/.env.example arb-api
 Repeat for other services adjusting ports as needed:


Dashboard: 3000


Analytics: 5000


Executor: 9000


Start PostgreSQL and Redis (if needed)
 You can use Podman or Homebrew-installed services:

 sql
CopyEdit
brew services start postgresql@16
brew services start redis


Verify Connection


Open http://localhost:3000 to view the dashboard


Use curl http://localhost:8080/settings to check API


Helm Local Deployment (Optional)
 If you want to deploy via Helm on Colima:

 bash
CopyEdit
helm install arb infra/helm/



3.4 Running Tests Locally
Each service has its own test runner. Use the unified test verifier to check that all critical tests pass before pushing code.
Run Test Verifier Script
bash
CopyEdit
chmod +x test/verify-env.sh
./test/verify-env.sh

What This Checks:
Jest (JavaScript/Node)

 bash
CopyEdit
cd api/ && npm test
cd dashboard/ && npx jest


PyTest (Python Analytics)

 bash
CopyEdit
cd analytics/ && pytest


Maven (Java Executor)

 bash
CopyEdit
cd executor/ && mvn test


If any test fails, the pre-push Git hook will block your commit from being pushed to GitHub (as designed in Batch 1 setup).
Section 4: Deployment Guide (Production)
 Includes:
4.1 Server Preparation


4.2 Kubernetes Setup


4.3 Secret Management


4.4 Helm Deployment


4.5 GPU Plugin Deployment



4.1 Server Preparation
Before deploying Prism Arbitrage on your production-grade server, ensure the following prerequisites are met.
Hardware Checklist (Minimum):
Dual Intel Xeon 4210 CPUs (20 cores, 40 threads)


96 GB RAM


2 × 800 GB SAS SSD (for main app and DB storage)


Tesla P4 GPU (PCIe)


10 GbE Network Interface


BIOS settings enabled for VT-d, SR-IOV, virtualization


Software Prerequisites:
OS: Ubuntu 22.04 LTS (minimal install preferred)


Container Runtime: containerd (installed separately)


System Packages:

 sql
CopyEdit
sudo apt update && sudo apt install -y \
  curl gnupg2 software-properties-common apt-transport-https \
  ca-certificates lsb-release nfs-common \
  jq git htop net-tools unzip


Kernel and GPU Setup:
NVIDIA GPU driver (data center version compatible with Tesla P4)

 nginx
CopyEdit
sudo ubuntu-drivers autoinstall


Reboot after installation


System Configuration:
Enable IP forwarding


Open ports: 22, 3000, 5000, 8080, 9000


Swap disabled (recommended for Kubernetes nodes)



4.2 Kubernetes Setup
Prism runs in a single-node Kubernetes cluster initialized via kubeadm.
Install Kubernetes Stack:
bash
CopyEdit
sudo apt install -y apt-transport-https ca-certificates curl

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt update
sudo apt install -y kubelet kubeadm kubectl

Initialize Kubernetes Cluster:
bash
CopyEdit
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

Post-Init Setup:
bash
CopyEdit
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

Install Pod Network (Flannel):
bash
CopyEdit
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml


4.3 Secret Management
Prism uses Kubernetes SealedSecrets to safely encrypt and deploy API credentials, tokens, and passwords.
Install kubeseal CLI:
bash
CopyEdit
brew install kubeseal

Steps to Seal a Secret:
Create a raw Kubernetes Secret YAML:

 yaml
CopyEdit
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
  namespace: default
type: Opaque
data:
  binanceKey: <base64 encoded>
  binanceSecret: <base64 encoded>


Encrypt it using the controller’s public key:

 bash
CopyEdit
kubeseal < secret.yaml > sealed-secret.yaml --format yaml


Commit sealed-secret.yaml to version control


Apply it like any other manifest:

 bash
CopyEdit
kubectl apply -f sealed-secret.yaml


Controller Deployment (Once per cluster):
bash
CopyEdit
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.23.0/controller.yaml


4.4 Helm Deployment
Each service in Prism is deployed via Helm using the provided chart.
Directory Structure:
infra/helm/Chart.yaml — chart definition


infra/helm/values.yaml — deployment settings


infra/helm/templates/ — service manifests


Install Helm (if not already):
bash
CopyEdit
brew install helm

Deploy the Entire App:
bash
CopyEdit
cd infra/helm
helm install prism-arbitrage . --namespace default

Upgrade in Place:
bash
CopyEdit
helm upgrade prism-arbitrage . --namespace default

Rollback If Needed:
bash
CopyEdit
helm rollback prism-arbitrage <revision>

Verify Pods and Services:
bash
CopyEdit
kubectl get pods
kubectl get svc

Important:
 Ensure SealedSecrets, GPU plugin, and all services' .env values are in place before running Helm installs.

4.5 GPU Plugin Deployment
To enable GPU inference for the analytics service on the Tesla P4, deploy the NVIDIA Kubernetes Device Plugin.
Install NVIDIA Docker Dependencies:
bash
CopyEdit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | sudo tee /etc/apt/sources.list.d/nvidia-container.list

sudo apt update && sudo apt install -y nvidia-container-toolkit
sudo systemctl restart containerd

Deploy the Plugin:
bash
CopyEdit
kubectl apply -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/v0.12.3/nvidia-device-plugin.yml

Verify GPU Resource is Detected:
bash
CopyEdit
kubectl describe node <your-node-name> | grep nvidia.com/gpu

Notes:
Analytics containers request nvidia.com/gpu: 1


Ensure that Helm values.yaml includes the proper GPU resource limits


Section 5: UI Dashboard
 Includes:
5.1 Logging In


5.2 Resume Button


5.3 Settings Panel


5.4 Visuals and Charts


5.5 Mobile Experience



5.1 Logging In
The Prism Arbitrage dashboard uses JWT (JSON Web Token) authentication via the /login API endpoint.
Login Flow:
User navigates to the dashboard login page (/login)


Enters email and password


Frontend sends a POST request to the API at /login


API validates credentials and returns a JWT if correct


Token is stored in browser memory and used in future API requests


User is redirected to /dashboard


Security Notes:
All tokens are time-limited and signed with a server-side secret


API responses use HTTPS


Failed logins trigger logs and alert events (optional)



5.2 Resume Button
When the system enters a panic state due to exceeded risk thresholds (e.g., daily loss, low win rate), trading halts automatically.
The dashboard shows a “Resume Trading” button when this happens.
What it Does:
Publishes a resume message to the control-feed Redis channel


Executor service listens for this signal


Upon receiving, it exits panic mode, logs an event, and resumes trade evaluation


Operator View:
A red banner is displayed when trading is paused


“Resume Trading” is available only when system is in panic state



5.3 Settings Panel
Operators can modify runtime configuration values using the Settings screen. All changes are made via controlled sliders, dropdowns, or input fields and submitted via the /settings API.
Editable Settings:
Personality Mode


Realistic, Aggressive, Auto


Per-Coin Exposure Cap (% of NAV)


Range: 1% – 50% (default: 10%)


Daily Loss Cap (% of NAV)


Triggers panic brake (default: 5%)


Latency Ceiling (ms)


Max allowed avg latency before pause (default: 250 ms)


Cold Sweep Cadence


Daily, Monthly, None


How It Works:
Settings are stored in PostgreSQL under settings table


Updates take effect instantly via hot reload


No pod restart is required


Error Handling:
Invalid values are rejected server-side


API responds with 400 and a message describing the problem



5.4 Visuals and Charts
The dashboard presents key metrics in real time using Prometheus-backed data streams.
Primary Charts:
Live Equity Curve


Tracks NAV over time


Reflects post-trade profit/loss


Trade Win Rate (Rolling)


Displays short-term and long-term win ratios


Alerts if win rate falls below threshold (e.g. 40%)


Average Latency


Rolling latency between opportunity detection and trade fill


Latency spikes may indicate network or exchange issues


Execution Count


Total number of trades executed per hour


Data Pipeline:
Prometheus scrapes /metrics from Executor and Analytics services


Dashboard queries these metrics and renders with charting library


Charting Library: Recharts (React-based), optimized for mobile + desktop

5.5 Mobile Experience
The dashboard is designed as a responsive SPA (Single Page Application) that works across modern browsers and mobile devices.
Optimizations:
Layout adapts for Safari and Chrome on iOS and Android


Charts are scrollable and collapsible for smaller screens


Buttons and sliders are enlarged for tap targets


Use Cases:
Remote operators can monitor system status and receive alerts from mobile


Can safely pause/resume trading on the go


View last trade and system health metrics from a phone


Security Considerations:
Session token is not stored in cookies


TLS enforced on all API endpoints


Logout clears memory token and redirects user to login



Visual Placeholder Note:
 Include screenshots of:
Login screen


Settings panel


Resume button in panic mode


Live charts (equity, win rate, latency)



Section 6: Personality Modes
 Includes:
6.1 Personality Modes Overview


6.2 Net Edge Thresholds


6.3 Switching Logic


6.4 Hot-Reload Behavior



6.1 Personality Modes Overview
Prism Arbitrage offers three trading “personalities” that adjust execution aggressiveness based on market conditions or operator preference. These are:
Realistic Mode


Trades only when net edge is high (≥ 0.5%)


Smaller position sizes


Prioritizes safety and capital preservation


Aggressive Mode


Trades when net edge is ≥ 0.2%


Uses larger bet sizing


Tolerates more volatility and slippage to capture more opportunities


Auto Mode


Dynamically switches between Realistic and Aggressive


Based on a rolling 7-day market volatility and hit-rate assessment


No operator intervention needed


These modes influence how often trades are executed, how much capital is deployed per trade, and which opportunities pass the RiskFilter.

6.2 Net Edge Thresholds
Each personality mode is tied to a minimum net edge threshold, which defines how profitable a trade must be (after fees and slippage) for it to be eligible.
Mode
Net Edge Threshold
Position Sizing
Notes
Realistic
≥ 0.5%
Conservative
Suitable for low-volatility environments
Aggressive
≥ 0.2%
High
Used when price dispersion is high
Auto
0.2–0.5% dynamic
Variable
Adapts to recent trade outcomes

These thresholds are enforced inside the RiskFilter class during trade evaluation.

6.3 Switching Logic (Auto Mode)
Auto Mode evaluates the following metrics on a rolling 7-day window:
Market Volatility Index (custom formula based on spread standard deviation)


Hit Ratio (proportion of profitable trades)


Execution Latency


Switch Rules:
If volatility > defined high threshold and hit-rate ≥ 50%, switch to Aggressive


If volatility drops or win-rate < 40%, revert to Realistic


Checks are made every 60 seconds during trading hours


All transitions are logged to Postgres with timestamps and reason codes.

6.4 Hot-Reload Behavior
Personality settings are hot-reloadable at runtime. This allows operators to:
Switch modes via the dashboard (Settings → Personality Mode)


Change thresholds using /settings API


Instantly apply new config without restarting containers


Technical Details:
Executor watches Redis for a control message when settings change


Settings are reloaded into memory instantly


All new trades after the reload use updated thresholds and bet sizing


Logging Example:
csharp
CopyEdit
[INFO] Personality mode updated: AGGRESSIVE → REALISTIC (Operator override)

Fallbacks:
If settings are invalid or Redis update fails, the system logs a warning and continues with current mode



Visual Placeholder Note:
 Include screenshots of:
Personality mode dropdown on settings page


Logs showing switch from AUTO to AGGRESSIVE


Sample trade difference between Realistic and Aggressive settings
Section 7: Strategy Engine
 Includes:
7.1 Opportunity Detection


7.2 Triangular Arbitrage


7.3 IOC Order Execution


7.4 Execution Latency Targets


7.5 Slippage and PnL Check



7.1 Opportunity Detection
Prism's core function is to detect profitable spread opportunities in real time across supported venues.
Types of Arbitrage Monitored:
Cross-Exchange Arbitrage:
 Buy a token on Exchange A at a lower price and sell it on Exchange B at a higher price.


Single-Exchange Triangular Arbitrage:
 Trade through a cycle of three tokens (e.g. USDT → ETH → BTC → USDT) to extract profit on rate imbalances.


Market Connectivity:
CEX adapters (e.g., Binance, Kraken, Coinbase) connect via WebSockets and REST fallback.


DEX adapters (e.g., Uniswap V3, PancakeSwap) use on-chain price feeds or GraphQL APIs.


All feeds update bid/ask every 250 ms, parsed and pushed into a central Redis channel (spread-feed).


Opportunity Format:
 Each opportunity message includes:
Buy and sell exchanges


Token pair


Gross edge %


Net edge %


Expected PnL (USD)


Execution latency estimate (ms)



7.2 Triangular Arbitrage
Within a single exchange, Prism scans for 3-token arbitrage loops.
Example:
Start with 10,000 USDT


Buy ETH using USDT


Sell ETH for BTC


Sell BTC back to USDT


If loop returns >10,000 USDT, the arbitrage is profitable.
Detection Algorithm:
Uses depth-aware book snapshots to simulate each leg


Evaluates slippage, fees, and time-to-fill


Only triggers if net edge ≥ configured threshold


Execution Characteristics:
All 3 legs are fired in a tight sequence


Auto-cancel is triggered if any leg partially fills


Profitable leg completion is required before moving funds


Risk Notes:
Triangular trades are more sensitive to latency and gas fees


More effective on DEXes where spread swings frequently



7.3 IOC Order Execution
Prism uses Immediate-or-Cancel (IOC) orders to avoid partial fills and hanging orders.
Why IOC?
Ensures capital is only used if full execution is possible


Avoids accidental exposure from partial fills


Reduces slippage risk on volatile pairs


Execution Flow:
SpreadOpportunity is passed from filter to execution queue


Executor places IOC orders simultaneously on both buy and sell exchanges


If both fill:


Calculate realized PnL


Log trade to Postgres


Update ProfitTracker


If either leg fails or partially fills:


Cancel all orders


Log as “near miss” to near_misses table


No position is held


IOC Limit Order Strategy:
Price is set tightly:


Buy: best ask - 0.01%


Sell: best bid + 0.01%


Ensures match without crossing spread unnecessarily



7.4 Execution Latency Targets
Prism is designed for ultra-low-latency environments. Target execution latency per opportunity is < 60 microseconds (µs) from detection to order dispatch.
Sources of Latency:
Exchange API rate limits


Network congestion


JVM garbage collection or Python GC pause


Redis pub/sub lag


Latency Controls:
Executor timestamps each stage:


Opportunity receipt


Risk filter pass


Order sent


Confirmation received


Averages are exported via Prometheus


Alerts are triggered if latency exceeds 250ms


Operator Dashboard:
Real-time chart of average execution latency


Outliers shown with timestamp and trade context



7.5 Slippage and PnL Check
Before executing a trade, the system validates slippage (price drift) and expected profitability after fees.
Slippage Check:
Compares expected price to actual book quote before placing order


Cancels if price has drifted beyond tolerance (e.g. ±0.15%)


Fee Adjustments:
Exchange fee estimates are retrieved from ExchangeAdapter.getFeeRate()


Typical CEX fee: 0.1% per leg


DEX fee includes gas + AMM fee


Final PnL Calculation:
ini
CopyEdit
PNL = (sell_price * sell_size - buy_price * buy_size) - (buy_fee + sell_fee)

Logged to the trades table


Tracked cumulatively by the ProfitTracker


Used to trigger cold wallet sweeps if thresholds are met



Visual Placeholder Note:
 Include:
Diagram of cross-exchange trade path


Screenshot of opportunity JSON message


Table comparing trade fill speed vs PnL outcomes


Section 8: Opportunity Filters
 Includes:
8.1 RiskFilter Logic


8.2 Threshold Configuration


8.3 Logging Rejected Trades


8.4 PostgreSQL Schema



8.1 RiskFilter Logic
The RiskFilter is the first line of defense before executing a trade. Its job is to reject trades that do not meet minimum profitability and latency thresholds—even if they appear profitable on paper.
Core Evaluation Criteria:
Net Edge Threshold:
 The profit percentage after accounting for fees and slippage.


Latency Ceiling:
 The maximum acceptable delay from opportunity detection to trade execution.


Method Signature (Java):
java
CopyEdit
boolean passes(SpreadOpportunity opp);

Logic:
If opp.netEdge < configuredThreshold, return false


If opp.latencyMs > maxLatencyMs, return false


Otherwise, return true


Rejected trades are logged for visibility and post-analysis.

8.2 Threshold Configuration
Risk thresholds are configured based on personality mode or direct API updates. These are reloaded live without restarting pods.
Setting Name
Default Value
Description
netEdgeThreshold
0.005 (0.5%)
Minimum edge required for execution
maxLatencyMs
250
Max acceptable latency in milliseconds

These values can be adjusted:
Via the dashboard (Settings Panel)


Through the /settings API endpoint


By updating the settings table in Postgres directly (not recommended)


Dynamic Reload Behavior:
Redis publishes control message when settings change


Executor reloads config in memory instantly



8.3 Logging Rejected Trades
Rejected opportunities that fail the RiskFilter are not discarded. Instead, they are logged as “near misses” for auditing and analytics.
Reasons for Rejection:
Below profit threshold


Latency too high


Stale opportunity


Invalid price spread


Logging Workflow:
Executed by the NearMissLogger Java class


Logs the opportunity data + reason for rejection


Stored in the near_misses table in PostgreSQL


Purpose:
Diagnose what kind of opportunities are failing


Understand how often risk limits are the cause


Feed analytics engine for training ML models


Example Log Message:
csharp
CopyEdit
[REJECTED] BTC/USDT: net edge 0.0032 < threshold 0.0050, latency OK


8.4 PostgreSQL Schema
Near misses are stored in the near_misses table for long-term retention.
Table Name: near_misses
Column Name
Type
Description
id
SERIAL
Primary key
timestamp
TIMESTAMP
Time the opportunity was evaluated
pair
TEXT
Token pair involved
buy_exchange
TEXT
Where asset was to be bought
sell_exchange
TEXT
Where asset was to be sold
gross_edge
FLOAT
Edge before fees
net_edge
FLOAT
Edge after fees/slippage
expected_profit_usd
FLOAT
Estimated USD profit
latency_ms
INTEGER
Execution latency estimate
reason
TEXT
Why the opportunity was rejected

Indexes:
timestamp (for time filtering)


reason (for grouped analysis)


pair (for pair-based filtering)


Usage in Analytics:
Source for model training: distinguish good vs. bad trade candidates


Visualized in Grafana or exported to CSV



Visual Placeholder Note:
 Include:
Screenshot of a rejected trade entry


Grafana panel: near misses over time


Sample settings.json showing threshold config


Section 9: Panic Brakes & Safety
 Includes:
9.1 Panic Brake Triggers


9.2 Circuit Breaker Logic


9.3 Resume Flow via Redis


9.4 Alert Flow on Panic



9.1 Panic Brake Triggers
Panic brakes are emergency shutdown mechanisms designed to halt all trading when the platform encounters risk conditions that could lead to significant losses.
Primary Triggers:
Daily Loss Cap Exceeded


If realized loss as a percentage of NAV exceeds configured cap (e.g. 5%)


Latency Ceiling Breach


If average execution latency exceeds the configured threshold (e.g. 250ms)


Minimum Win Rate Breach


If rolling win rate falls below a configured threshold (e.g. 40%)


System Behavior:
Trading is halted immediately


Executor sets isPanic = true


Opportunity evaluation loop is bypassed


Alerts are dispatched to all configured channels



9.2 Circuit Breaker Logic
In addition to panic brakes, Prism supports global circuit breakers which function like kill switches for sustained abnormal behavior.
Evaluation Intervals: Every 60 seconds (rolling averages)
Trigger Conditions:
Drawdown Breaker: If cumulative PnL falls below a global drawdown threshold


Win Rate Breaker: If 1-hour win rate remains below 35% for more than 5 minutes


Repeated Panic Events: Multiple panic events in a short window trigger a lockout


Actions on Trigger:
All services log the event with CIRCUIT_BREAKER_TRIGGERED message


Executor halts trade processing


Redis is updated with panic state


Alerts are escalated (marked high severity)


Example Log Entry:
css
CopyEdit
[CIRCUIT BREAKER] Win rate dropped to 32% for 5m — Trading halted.


9.3 Resume Flow via Redis
Once halted, Prism awaits a resume signal via Redis to re-enable trading. This enables remote operators to recover without server access.
Resume Flow:
Operator clicks “Resume Trading” in dashboard


Frontend sends a command to API → API publishes resume to Redis control-feed channel


Executor listens on this channel in a background thread


When message received:


Panic flag is cleared (isPanic = false)


Trading loop resumes


Fail Safes:
Executor checks that metrics have normalized before actually resuming


If thresholds are still breached, it ignores the resume attempt and logs an error


Example Log:
csharp
CopyEdit
[RESUME SIGNAL RECEIVED] Resuming trade evaluation


9.4 Alert Flow on Panic
Alerts are dispatched in real time when a panic or circuit breaker is triggered.
Channels:
Email (SMTP/Gmail)


Telegram Bot


Webhook (custom receivers)


Alert Payload Format (JSON):
json
CopyEdit
{
  "type": "panic_brake",
  "trigger": "daily_loss_cap",
  "value": 0.062,
  "threshold": 0.05,
  "timestamp": "2025-07-06T14:28:22Z"
}

Operator Message Preview:
[ALERT] Panic brake triggered on loss threshold: -6.2% today (limit: 5%). Trading paused.
Escalation Behavior:
AlertManager handles retries and fallback channels


If alerts fail to send, errors are logged to console and disk


Operators can test alert delivery via /alert/test endpoint



Visual Placeholder Note:
 Include:
Screenshot of panic alert email or Telegram message


Screenshot of the red “panic state” banner on dashboard


Sample Prometheus alert rule for panic brake triggers


10.1 SMTP Alerts
Prism includes native support for sending email alerts using Gmail’s SMTP servers. This is used to notify operators when critical events occur such as:
Panic brakes


Circuit breaker triggers


Resume signals


Mode changes


Daily summary snapshots (optional feature)


Configuration Variables (in .env):
SMTP_USER – your Gmail address (must have app password enabled)


SMTP_PASS – app-specific Gmail password


ALERT_RECIPIENT – destination email for alerts


Setup Example:
env
CopyEdit
SMTP_USER=prism.alerts@gmail.com
SMTP_PASS=xxxxxx_app_password
ALERT_RECIPIENT=ops_team@example.com

Sending Behavior:
Uses nodemailer in the Node.js API


Each alert includes timestamp, trigger type, and affected system


Includes fallback logging if mail fails to send


Email Example:
makefile
CopyEdit
Subject: [PRISM ALERT] Panic Brake Triggered

Body:
Loss today exceeded threshold (-6.1% vs max -5.0%).
Trading paused. Action required.


10.2 Telegram Alerts
Operators can also receive alerts through a dedicated Telegram bot.
Steps to Enable:
Create a Telegram Bot via BotFather


Retrieve your bot token


Send a message to your bot to start the session


Use a helper script or endpoint to get your chat_id


Config Example (.env):
env
CopyEdit
TELEGRAM_TOKEN=1234567890:ABCDEF_bot_token
TELEGRAM_CHAT_ID=983729172

Alert Types Sent:
Panic brake triggers


Resume events


Low liquidity warnings


Daily summary (optional future feature)


Bot Output Example:
🔴 ALERT: Trading Paused
 Daily loss cap exceeded (-6.2%).
 Use Resume button or /resume API to resume trading.
Alerts are formatted using Markdown for readability.

10.3 Webhook Alerts
Prism supports extensible JSON-based alerts via POST webhooks. This allows you to integrate with:
Slack


PagerDuty


OpsGenie


Custom internal systems


Configuration (.env):
env
CopyEdit
ALERT_WEBHOOK_URL=https://hooks.example.com/prism

Payload Structure:
json
CopyEdit
{
  "type": "alert",
  "channel": "panic",
  "message": "Trading paused due to loss cap exceeded",
  "timestamp": "2025-07-06T12:45:00Z"
}

Behavior:
Retries on failure with exponential backoff


Logs success or failure to console + disk


Uses Axios in the API service with error handling



10.4 AlertManager Module
The AlertManager is a shared module in the API service that coordinates all alert types and handles failover logic.
Key Methods:
js
CopyEdit
sendAlert(type, message)

Internally Dispatches To:
sendEmail(subject, body)


sendTelegram(message)


sendWebhook(payload)


Graceful Handling:
If any alert channel is misconfigured or unavailable, others still proceed


Alerts are logged to /logs/alerts.log for auditing


AlertManager Flow:
Panic brake detected in Executor


Executor calls API → /alert/panic


AlertManager dispatches to all enabled channels


Logs are updated and status returned to Executor


Test Endpoint:
 You can test alert configuration by hitting:
bash
CopyEdit
POST /alert/test

With a sample payload, to ensure all channels are functional.

Visual Placeholder Note:
 Include:
Screenshot of Telegram alert


Sample alert email content


JSON payload example for Slack webhook


Diagram of AlertManager flow



Section 11: Rebalancer
 Includes:
11.1 Rebalance Frequency


11.2 Target Distribution Logic


11.3 Dry Run and Logging



11.1 Rebalance Frequency
The Prism Rebalancer ensures optimal capital allocation across all connected exchanges by scanning for imbalances every 15 minutes.
Objective:
 Maintain even or target-weighted distribution of available capital so no single exchange is underfunded or overfunded relative to expected trade volume.
Trigger Interval:
Every 15 minutes by default


Configurable in the settings JSON


Eligible Assets:
Only actively traded base assets (e.g. USDT, ETH, BTC)


Excludes wrapped or LP tokens


Exchanges Scanned:
All enabled CEX accounts (e.g. Binance, Kraken, KuCoin, Coinbase)


DEXes are excluded from rebalancing since they do not hold balances natively



11.2 Target Distribution Logic
The rebalancer calculates ideal per-exchange balances and moves capital if actual balances deviate by a large margin.
Logic:
Calculate total available capital across exchanges


Derive target balance per exchange = total / number of exchanges


Identify exchanges with:


30% excess = source



30% deficit = target



Generate transfer instructions to move capital from source → target


No real transfers are made by default (dry-run first)


Hybrid Rule (Optional Override):
 If the transfer would:
Involve ≥ £5,000 equivalent OR


Represent ≥ 30% of total capital from one exchange


... then it is considered valid for execution (with cold sweep fallback logic if enabled).
Rebalance Types:
Soft rebalance: Inform operator via alert/log


Hard rebalance: Execute withdrawal + deposit between exchanges (manual/automated depending on API permissions)



11.3 Dry Run and Logging
Before any transfer is executed, Prism runs a dry run scan and logs all proposed movements for operator review.
Log Format:
yaml
CopyEdit
[REBALANCER] Overfunded: Binance +£8,200 | Underfunded: Kraken -£6,900
Suggested move: £6,000 from Binance to Kraken
Status: DRY-RUN

Executor Output (Live Preview):
Timestamp


Source exchange


Target exchange


Asset (e.g. USDT)


Amount suggested


Execution status (dry-run, executed, rejected)


Operator Options:
Accept rebalances manually via API or CLI


Approve all logic-driven rebalance actions automatically (toggle in config)


Disable rebalancing completely during maintenance or audits


Security Considerations:
Transfers use signed API keys stored as sealed secrets


Execution retries have backoff protection


System pauses rebalancing if any panic brake is triggered



Visual Placeholder Note:
 Include:
Example rebalance log screenshot


Bar chart showing capital per exchange pre/post rebalance


CLI or dashboard interface mockup for rebalancer control
Section 12: Cold Wallet Sweeps
 Includes:
12.1 Sweep Logic


12.2 Sweep Cadence Configuration


12.3 Cold Wallet Integration



12.1 Sweep Logic
Prism Arbitrage includes an automatic cold wallet sweep mechanism to secure realized profits and reduce hot wallet exposure. This system transfers capital from active exchange balances to a predefined cold storage address once specific thresholds are met.
Triggering Conditions (Hybrid Rule):
 A cold sweep is triggered if either of the following is true:
Realized PnL ≥ £5,000


Realized PnL ≥ 30% of total capital deployed


These values are configurable in the system settings.
Evaluation Frequency:
Once per hour (when trading is active)


Manually triggerable via API or Dashboard


Sweep Decision Flow:
ProfitTracker checks cumulative realized profit


Current NAV across all exchanges is calculated


If either threshold is met:


Sweep is scheduled


Amount is transferred to cold wallet address


Log entry is created in system audit log


If not:


No action taken


System continues monitoring



12.2 Sweep Cadence Configuration
Operators can define how often the system is allowed to perform cold wallet sweeps. This prevents overly frequent small sweeps and provides operational predictability.
Available Sweep Modes:
Daily:
 Sweep evaluation runs once every 24 hours at a configured time (e.g., midnight UTC)


Monthly:
 Sweep only if condition met and it’s the first day of the month


None:
 Disables all automated sweeps; sweeps can only be triggered manually


Configuration Sources:
Dashboard dropdown menu (Settings Panel → Sweep Cadence)


/settings API endpoint


Stored in settings table in PostgreSQL


Fallback Behavior:
 If mode is set to none, but hybrid rule is still met, the system logs a notice but does not execute the sweep.
Operator Prompt Example:
ini
CopyEdit
[SWEEP ELIGIBLE] Profit = £6,830 | Cadence: NONE — Sweep skipped


12.3 Cold Wallet Integration
The system uses a configurable cold wallet address (or multiple addresses per asset) as the destination for all sweeps.
Supported Assets:
USDT (TRC20 or ERC20)


BTC


ETH


Address Configuration:
Stored securely in Kubernetes as a SealedSecret


Example:

 yaml
CopyEdit
coldWallet:
  usdt: "0x123abc...890"
  btc: "bc1qxyz...def"
  eth: "0x456def...999"


Can be updated via Helm values or directly in secret manifest


Transfer Execution (Simulation or Real):
Most sweep logic is simulated unless transfer permissions are enabled


Exchange API withdrawal commands are wrapped in an approval layer


Optional: dual-signature requirement before sweeping funds


Security Features:
No private keys stored on device


Transfers are logged and monitored


Alerts sent on sweep completion


Post-Sweep Behavior:
Executor updates internal profit counter


Cold wallet balance excluded from live NAV calculations


Sweep recorded in sweep_log (PostgreSQL or flat log depending on deployment)



Visual Placeholder Note:
 Include:
Sample sweep event log entry


Screenshot of sweep settings in dashboard


Diagram of sweep logic from ProfitTracker → Transfer → Audit log


Section 13: Trade Logging & PnL
 Includes:
13.1 TradeLogger Schema


13.2 PnL Calculation


13.3 ProfitTracker Logic


13.4 Trade Visibility



13.1 TradeLogger Schema
Every completed trade is persistently recorded in the trades table in PostgreSQL. This ensures full auditability and supports both analytics and operator visibility.
Table Name: trades
Column Name
Type
Description
id
SERIAL
Primary key
timestamp
TIMESTAMP
Time the trade was executed
pair
TEXT
Trading pair (e.g., BTC/USDT)
buy_exchange
TEXT
Exchange where asset was bought
sell_exchange
TEXT
Exchange where asset was sold
net_edge
FLOAT
Net edge (%) after fees/slippage
gross_edge
FLOAT
Gross edge before adjustments
pnl_usd
FLOAT
Realized profit or loss in USD
position_size
FLOAT
Size of the trade (base asset or quote asset)
latency_ms
INTEGER
Time from detection to execution
mode
TEXT
Personality mode at time of trade

Indexes:
timestamp for time-based queries


pair for per-asset trade logs


pnl_usd to enable performance analysis


Retention Strategy:
Archived monthly to cold storage (optional)


Supports long-term export to CSV or Parquet for analytics



13.2 PnL Calculation
Each trade’s profit or loss is calculated based on actual execution prices, applicable exchange fees, and any detected slippage.
Formula:
java
CopyEdit
Realized PnL = (Sell Price × Sell Size) - (Buy Price × Buy Size) - Total Fees

Components:
Buy Price / Sell Price: From exchange order fills


Size: Volume of asset bought/sold


Fees: Estimated from static exchange rate (e.g. 0.1%) or queried dynamically from adapter


Slippage: Measured by comparing book quote vs execution fill


Example Calculation:
nginx
CopyEdit
Buy 1.0 BTC at $20,000 (Binance)
Sell 1.0 BTC at $20,120 (Kraken)
Fee: 0.1% per leg

→ Gross PnL = $120
→ Fees = $40 (combined)
→ Net PnL = $80

All values are recorded with high precision (decimal storage) and reconciled against balance changes for audit.

13.3 ProfitTracker Logic
The ProfitTracker is an in-memory utility that tracks cumulative profit/loss during runtime and provides immediate insight for:
Cold wallet sweep eligibility


Live equity curve rendering


Win-rate and Sharpe ratio calculations


Key Methods:
add(double pnl) – Add new realized profit or loss


get() – Returns cumulative total


reset() – Clears tracker (usually after sweep or manual reset)


Persistence:
Cumulative values are backed by PostgreSQL for recovery


Restored on executor service restart


Use Cases:
Triggers cold sweep if thresholds are met


Feeds dashboard metrics and analytics service


Visible to operator in real-time dashboard UI


Example Output (Console Log):
bash
CopyEdit
[PnL TRACKER] Added $122.48 | Cumulative Total: $6,837.19


13.4 Trade Visibility
Operators and engineers can inspect trade history through both:
Dashboard UI


Analytics tab shows trade table


Columns: timestamp, pair, exchanges, profit, mode


Sortable by timestamp or PnL


Pagination and download options available (CSV)


API Endpoint


GET /api/trades/history


Returns JSON array of trade objects


Optional query params: date range, pair, min/max profit


Sample Response:
json
CopyEdit
[
  {
    "timestamp": "2025-07-06T10:30:00Z",
    "pair": "ETH/USDT",
    "buy_exchange": "Binance",
    "sell_exchange": "Kraken",
    "net_edge": 0.0048,
    "pnl_usd": 52.13,
    "latency_ms": 47
  }
]

Security:
All access to trade history is gated behind JWT authentication


Read-only access tokens can be configured for auditors or analysts


Operator Usage:
Review last 10 trades after panic brake


Identify which mode generated most PnL


Export data for reporting



Visual Placeholder Note:
 Include:
Table of sample trades from dashboard


Graph of cumulative PnL over time


Screenshot of API JSON response



Section 14: Analytics Engine
 Includes:
14.1 Analytics Metrics


14.2 LSTM Model Architecture


14.3 Training Pipeline


14.4 Inference Pipeline


14.5 GPU Acceleration


14.6 Prometheus Metrics


14.7 Future Roadmap



14.1 Analytics Metrics
The analytics engine continuously computes quantifiable metrics for operational performance monitoring and predictive modeling.
Key Metrics Tracked:
Rolling PnL – Sum of all realized profit/loss over 1h, 24h, 7d windows


Win Rate – Ratio of profitable trades to total trades


Hit Ratio – How often the executor successfully captures an opportunity without slippage violation


Average Execution Latency – Mean time from opportunity detection to order fill


Sharpe Ratio – Return-to-volatility ratio for strategy evaluation


These metrics are available:
Via the dashboard in chart form


Through the /metrics Prometheus endpoint


As input to future reinforcement learning pipelines



14.2 LSTM Model Architecture
A Long Short-Term Memory (LSTM) model is used to predict the probability that a spread opportunity will be profitable.
Model Configuration:
Framework: TensorFlow Keras


Input Shape: (timesteps=15, features=4)


Features:


Net Edge


Slippage Estimate


Latency Estimate


Volatility Index


Architecture:
Input Layer → LSTM(64 units) → Dropout(0.2)


Dense(32) → ReLU Activation


Output: Dense(1) with Sigmoid (probability between 0–1)


Optimizer: Adam
 Loss Function: Binary Crossentropy
 Activation: Sigmoid
 Batch Size: 32
 Epochs: 25
The model predicts the binary outcome: “Would this trade have been profitable?”

14.3 Training Pipeline
Training data is generated synthetically using logged trade and near-miss data.
Steps:
Generate 10,000 synthetic samples based on historical spreads


Label each sample:


1 if net edge > threshold and trade succeeded


0 if trade failed or was rejected due to filter


Normalize features (min-max scaling)


Split into train/test sets (80/20)


Train LSTM model and evaluate:


Accuracy


Precision/Recall


ROC AUC Score


Model Persistence:
Saved as model.h5


Stored inside /analytics/model/ directory


Reloaded on service start


Retraining Frequency:
Manual (optional) or automated weekly (future)


Supported by train.py script inside /analytics/



14.4 Inference Pipeline
The analytics service exposes a POST endpoint to score new spread opportunities.
Endpoint: /predict
 Method: POST
 Input: Array of spreads
 Output: Array of probabilities
Input Format:
json
CopyEdit
[
  [0.005, 0.0002, 45, 0.013],  // edge, slippage, latency, volatility
  [0.002, 0.0005, 72, 0.025]
]

Output:
json
CopyEdit
[0.87, 0.29]

These scores represent the model's confidence that a trade will result in profit.
API Behavior:
Loads model at app start


Accepts batch inference (2–500 samples)


Rejects malformed or missing inputs


Uses structured logging to trace inference latency



14.5 GPU Acceleration
The model is designed to run on TensorFlow with GPU support using a Tesla P4 card.
Behavior:
On service startup, the engine checks for GPU availability


If detected:


TensorFlow binds to the GPU (nvidia.com/gpu)


Model inference is hardware accelerated


If not detected:


Falls back to CPU


Logs a warning: [WARNING] GPU not available — running on CPU


Requirements:
NVIDIA GPU driver installed


Kubernetes node must expose nvidia.com/gpu: 1 as resource


Pod spec must request GPU device in Helm chart


Performance Impact:
GPU inference is ~10× faster than CPU


Allows scoring of 1,000+ spreads per second



14.6 Prometheus Metrics
Analytics service exposes several Prometheus-compatible metrics under /metrics.
Exported Metrics:
inference_latency_seconds – Histogram of time taken for predictions


inference_count_total – Total number of prediction requests


gpu_mode_enabled – 1 if GPU active, 0 otherwise


prediction_error_count – Number of failed prediction attempts


training_loss – Loss value during model training (if in dev mode)


Example Metric Output:
bash
CopyEdit
# HELP inference_latency_seconds Average time to run prediction
# TYPE inference_latency_seconds histogram
inference_latency_seconds_bucket{le="0.01"} 238
...

These can be visualized in Grafana and used to trigger alerts if latency spikes.

14.7 Future Roadmap
Planned analytics upgrades include:
Online Learning


Retrain model using live trade results


Incremental updates every 6h or 24h


Reinforcement Learning (RL) Mode


Agent-based model to maximize long-term capital retention


Incorporates regret minimization over trade sequence


Expanded Feature Set


Add new features: order book depth, token correlation, macro news events


Integrate gas cost estimator (for DEX trades)


Confidence-Adaptive Execution


Modify trade sizing based on model confidence (e.g. 0.95 score = high bet)


Anomaly Detection


Flag unexpected metric behavior in real time


Detect signal decay or model drift



Visual Placeholder Note:
 Include:
Screenshot of analytics dashboard


Example /predict request and response


Diagram: Model input → LSTM → Output


Performance chart: GPU vs CPU inference time



Section 15: Prometheus & Monitoring
 Includes:
15.1 Executor Metrics


15.2 Analytics Metrics to Grafana


15.3 Alert Thresholds



15.1 Executor Metrics
The Executor service exports real-time operational metrics via a /metrics endpoint for collection by Prometheus.
Key Metrics Exposed:
Metric Name
Type
Description
executor_latency_ms
Gauge
Average latency per trade opportunity
executor_trade_success_count
Counter
Number of successfully executed trades
executor_trade_failure_count
Counter
Number of failed or rejected trades
executor_panic_triggered
Gauge
1 if system is in panic state, 0 otherwise
executor_active_mode
Gauge
Encodes current personality mode as numeric
executor_slippage_violation
Counter
Number of trades rejected due to slippage limits

How They Are Used:
Plotted as real-time graphs in Grafana


Tracked over 5m, 1h, and 24h intervals


Drive conditional logic for automated alerts (e.g., if panic triggered)


Exporter Format:
 All metrics are exposed in Prometheus text format (RFC 2021) and updated every 5 seconds.

15.2 Analytics Metrics to Grafana
The Analytics service also exposes metrics to Prometheus, which can be visualized and correlated with trade activity.
Analytics Metrics:
inference_latency_seconds: Time to compute predictions


inference_count_total: Total predictions served


gpu_mode_enabled: 1 if GPU detected, 0 otherwise


rolling_win_rate: Proportion of profitable trades


sharpe_ratio: Real-time Sharpe ratio (if enabled)


Grafana Dashboard Panels:
 Typical analytics monitoring includes:
Inference latency over time


Win rate per mode (Realistic vs Aggressive)


PnL and Sharpe plotted on dual-axis


Prediction volume spike detection (possible strategy decay)


Deployment Notes:
Prometheus automatically scrapes /metrics endpoints from both services


Targets are defined via static config or Kubernetes service discovery


Grafana connects to Prometheus via port 9090


Security:
All endpoints are internal unless exposed via ingress (disabled by default)


Requires JWT token or VPN access for external visibility



15.3 Alert Thresholds
Operators can define Prometheus alerting rules that fire based on system performance degradation or risk condition breaches.
Common Alerting Rules:
High Latency


yaml
CopyEdit
alert: HighExecutionLatency
expr: executor_latency_ms > 250
for: 2m
labels:
  severity: warning
annotations:
  summary: "Executor latency high"
  description: "Latency exceeds 250ms for more than 2 minutes"

Panic State Triggered


yaml
CopyEdit
alert: PanicBrakeActivated
expr: executor_panic_triggered == 1
for: 30s
labels:
  severity: critical
annotations:
  summary: "System is in panic state"
  description: "Trading has been halted due to safety brake"

Low Win Rate


yaml
CopyEdit
alert: LowWinRate
expr: rolling_win_rate < 0.35
for: 5m
labels:
  severity: warning
annotations:
  summary: "Low trade win rate"
  description: "Win rate has fallen below 35% over last 5 minutes"

Alert Delivery:
Routed through AlertManager (via webhook, email, Telegram)


Severity levels determine routing rules


Can be linked to Slack, PagerDuty, or OpsGenie


Tuning Strategy:
Start with conservative thresholds (e.g. 0.4 win rate)


Tighten thresholds as platform stabilizes


Regularly audit alerts to reduce noise



Visual Placeholder Note:
 Include:
Screenshot of Grafana dashboard with trade success/latency charts


Prometheus expression browser sample output


Diagram showing: Executor + Analytics → Prometheus → Grafana → AlertManager


Section 16: CI/CD Pipeline
 Includes:
16.1 CI Test Flow


16.2 SBOM Generation


16.3 Security Scanning


16.4 Static Analysis


16.5 Release Tagging



16.1 CI Test Flow
Prism uses GitHub Actions to run a unified CI pipeline on every push, PR, and release tag. This prevents broken code from being merged or deployed.
CI Workflow Includes:
Checkout Source Code


Build Services


dashboard/


api/


executor/


analytics/


Run Unit and Integration Tests


Jest for JS/TS services


PyTest for analytics


Maven for Java executor


Test Verifier Script


Ensures all test runners produce passing results


Blocks merge if any fail


Lint Check (see 16.4)


Build Docker Images (Podman)


Validate Kubernetes YAMLs (kubectl --dry-run)


Test Fail Behavior:
Build fails fast


Pre-push Git hook blocks local pushes


GitHub PR UI shows failing status


Command Example:
bash
CopyEdit
./test/verify-env.sh


16.2 SBOM Generation
Each build produces a Software Bill of Materials (SBOM) using Syft to ensure supply chain transparency.
Why SBOM?
Tracks all third-party dependencies


Required for compliance in some jurisdictions (FCA, ISO 27001)


Generated Format:
JSON SBOM per service (e.g., sbom-dashboard.json)


Contains:


Package names and versions


Source registries


CVE status (from Trivy if integrated)


Tool Used:
bash
CopyEdit
syft dashboard:latest -o json > sbom-dashboard.json

Where It Goes:
Uploaded to GitHub Release on tagging (batch-X-complete)


Archived in release artifacts folder



16.3 Security Scanning
Every container image is scanned using Trivy for high-severity vulnerabilities before it’s allowed to pass CI.
Scan Targets:
arb-api


arb-dashboard


arb-executor


arb-analytics


What Trivy Checks:
OS-level CVEs (e.g., Debian base)


Node packages (npm), Python packages (pip), Java packages (Maven)


Configuration risks (optional mode)


Sample Trivy Step in CI:
yaml
CopyEdit
- name: Trivy Scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: arb-api

Pass/Fail Criteria:
Build fails if high or critical CVEs are found


Reports attached to GitHub summary


Developers must patch vulnerable packages



16.4 Static Analysis
Static code analysis tools are used to ensure code quality and prevent anti-patterns.
Per-Service Tools:
Language
Tool
Command
JavaScript
ESLint
eslint .
Python
Flake8
flake8 analytics/
Java
Checkstyle
mvn checkstyle:check

CI Behavior:
Runs after unit tests


Any violations block merge


Configurable rulesets available in each project’s root


Sample Output (ESLint):
typescript
CopyEdit
error: Unexpected console statement (no-console)
error: 'x' is defined but never used


16.5 Release Tagging
Each successful batch or milestone ends with a Git tag and automated release on GitHub.
Tagging Convention:
batch-1-complete, batch-2-complete, ... batch-10-complete


Major releases also tagged: v1.0.0, v1.1.0, etc.


Git Commands:
bash
CopyEdit
git tag batch-7-complete
git push origin batch-7-complete

Release Automation:
GitHub Actions listens for tag push


Builds all containers


Uploads SBOMs


Generates a changelog entry


Publishes full GitHub Release with all artifacts


Changelog Format:
markdown
CopyEdit
## [Batch 7] - 2025-07-08

### Added
- Panic brake system
- Gmail/Telegram/Webhook alerts
- Redis resume handler

### Fixed
- Latency spike bug on Binance adapter


Visual Placeholder Note:
 Include:
Screenshot of passing GitHub Actions run


Trivy scan summary output


GitHub release panel with SBOM artifacts


Flowchart of CI pipeline from commit → deploy


Section 17: Secrets Management
 Includes:
17.1 Secret Injection


17.2 Encryption Flow


17.3 Secret Rotation



17.1 Secret Injection
Prism Arbitrage uses Kubernetes SealedSecrets to manage and inject sensitive credentials securely into containers at runtime.
Types of Secrets Handled:
CEX API keys and secrets (e.g., Binance, Kraken)


SMTP credentials (Gmail)


Telegram bot token and chat ID


JWT signing secrets


Cold wallet destination addresses


Why SealedSecrets?
Secrets can be stored encrypted in version control


Only the SealedSecrets controller can decrypt them inside the Kubernetes cluster


Prevents accidental exposure of credentials in source or Git history


How Secrets Are Used in Services:
Injected as environment variables via envFrom.secretRef in Kubernetes manifests


Mapped automatically by the language runtime (e.g., process.env, System.getenv())


Deployment Example (Helm Template Snippet):
yaml
CopyEdit
envFrom:
  - secretRef:
      name: api-secrets

Service Reads:
js
CopyEdit
const smtpUser = process.env.SMTP_USER;
const binanceKey = process.env.BINANCE_API_KEY;


17.2 Encryption Flow
To use SealedSecrets, follow this process:
Step 1 – Create Raw Secret YAML
yaml
CopyEdit
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
  namespace: default
type: Opaque
stringData:
  SMTP_USER: "alerts@prism.com"
  SMTP_PASS: "app_specific_password"
  JWT_SECRET: "verylongrandomsecret"

Step 2 – Encrypt With kubeseal
bash
CopyEdit
kubeseal < secret.yaml > sealed-secret.yaml --format yaml

This uses the cluster’s public key to encrypt the secret


Output is safe to commit to GitHub


Step 3 – Apply Sealed Secret
bash
CopyEdit
kubectl apply -f sealed-secret.yaml

Step 4 – Controller Decrypts Automatically
SealedSecrets controller reads the sealed secret


Decrypts it at runtime


Injects it into the pod as a standard Kubernetes Secret


Controller Setup (once per cluster):
bash
CopyEdit
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.23.0/controller.yaml


17.3 Secret Rotation
To rotate a secret (e.g., expired API key), follow this safe procedure:
Rotation Process:
Edit the base64 value in the original secret.yaml


Re-seal the secret using the same command:

 bash
CopyEdit
kubeseal < updated-secret.yaml > sealed-secret.yaml --format yaml


Commit the new sealed secret file


Apply it to the cluster:

 bash
CopyEdit
kubectl apply -f sealed-secret.yaml


Restart only affected pods (optional – most services reload secrets on startup)


Batch Rotation:
Helm supports injecting multiple new secrets via values.yaml


CI pipeline can automate the seal + apply flow (future enhancement)


Security Notes:
All secrets use stringData not data to avoid needing to manually encode values


Only the person with access to the SealedSecrets controller private key can decrypt values outside of the cluster


Helm Tip:
 If using Helm charts for deployment, you can define encrypted values inside secrets/sealed-secret.yaml and mount into pods using values.yaml overrides.

Visual Placeholder Note:
 Include:
Screenshot of SealedSecret YAML file


Diagram: Developer → kubeseal → GitHub → Kubernetes → Pod


Warning banner example for missing env vars in service logs
Section 18: API Gateway
 Includes:
18.1 /login Endpoint


18.2 /settings Endpoint


18.3 /opportunities Endpoint


18.4 /metrics Endpoint



18.1 /login Endpoint
This endpoint handles user authentication and generates a signed JWT for the dashboard to use in subsequent API calls.
Endpoint:
 POST /api/login
Input:
json
CopyEdit
{
  "email": "user@prism.com",
  "password": "examplepassword"
}

Output:
json
CopyEdit
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC..."
}

Behavior:
Validates user credentials (against database or in-memory config)


Returns JWT with standard claims:


sub: user ID or email


iat: issued at


exp: expiry timestamp


Token must be included as a bearer token in all future requests:

 makefile
CopyEdit
Authorization: Bearer <token>


Failure Response:
401 Unauthorized with error message if credentials are invalid


Security Notes:
Token secret is stored as a sealed secret (JWT_SECRET)


Token expiration: default 24 hours



18.2 /settings Endpoint
Used by the dashboard and CLI tools to retrieve and update runtime configuration.

GET /api/settings
Purpose: Returns current configuration used by the Executor, Rebalancer, and RiskFilter.
Sample Response:
json
CopyEdit
{
  "personality_mode": "AUTO",
  "net_edge_threshold": 0.005,
  "max_latency_ms": 250,
  "coin_exposure_cap_pct": 10,
  "loss_cap_pct": 5,
  "sweep_cadence": "monthly"
}

Fields:
personality_mode: REALISTIC, AGGRESSIVE, or AUTO


net_edge_threshold: Min profit % (post-fee)


max_latency_ms: Latency limit in ms


coin_exposure_cap_pct: NAV cap per asset


loss_cap_pct: Daily drawdown trigger


sweep_cadence: none, daily, or monthly



POST /api/settings
Purpose: Updates one or more configuration fields.
Request Example:
json
CopyEdit
{
  "personality_mode": "REALISTIC",
  "loss_cap_pct": 4
}

Behavior:
Validates new values


Updates settings table in PostgreSQL


Notifies Executor via Redis pub/sub (config-feed)


New settings take effect immediately


Failure Response:
400 Bad Request with validation error if field values are invalid


Security:
JWT token must be included


Only authenticated users can update settings



18.3 /opportunities Endpoint
This endpoint exposes recent spread opportunities seen by the system.
GET /api/opportunities
Purpose: Lists the most recent valid or rejected arbitrage opportunities. Useful for visualizing system input activity and potential missed trades.
Sample Response:
json
CopyEdit
[
  {
    "pair": "BTC/USDT",
    "buy_exchange": "Binance",
    "sell_exchange": "Kraken",
    "gross_edge": 0.0075,
    "net_edge": 0.0041,
    "latency_ms": 42,
    "reason": "PASSED"
  },
  {
    "pair": "ETH/USDT",
    "buy_exchange": "Bybit",
    "sell_exchange": "OKX",
    "gross_edge": 0.0068,
    "net_edge": 0.0024,
    "latency_ms": 121,
    "reason": "REJECTED: low edge"
  }
]

Query Options (planned):
limit: number of rows (default 20)


filter: passed or rejected


exchange: buy or sell venue


pair: filter by token pair


Use Cases:
Confirm spreads are being detected


Review why opportunities are rejected


Monitor net edge compression across venues



18.4 /metrics Endpoint
Prometheus scrapes this endpoint from the API service to track internal system health.
GET /api/metrics
Output: Prometheus-formatted text block
Sample Response:
bash
CopyEdit
# HELP api_request_count_total Total number of requests
# TYPE api_request_count_total counter
api_request_count_total 1562

# HELP alert_dispatch_failures_total Alerts that failed to send
# TYPE alert_dispatch_failures_total counter
alert_dispatch_failures_total{channel="email"} 1
alert_dispatch_failures_total{channel="telegram"} 0

Available Metrics:
api_request_count_total


alert_dispatch_failures_total


settings_update_total


login_failures_total


latency_warning_count


panic_resume_count


Use Cases:
Alert reliability monitoring


API usage analysis


Dashboard load diagnostics


Security:
Typically protected by internal-only network access


Can be gated with basic auth or JWT in future



Visual Placeholder Note:
 Include:
Screenshot of settings panel linked to /settings


Sample Prometheus output block from /metrics


Postman or Swagger mock of /opportunities query
Section 19: Storage System
 Includes:
19.1 Redis Use Cases


19.2 PostgreSQL Schema


19.3 Prometheus Data Model



19.1 Redis Use Cases
Prism uses Redis for high-speed messaging and in-memory caching. It plays a central role in real-time communication between services.
Key Uses in the Platform:
Spread Feed (Pub/Sub)


Channel: spread-feed


Source: CEX/DEX adapters


Subscribers: Executor, Analytics


Publishes every 250ms with new bid/ask spreads


Control Feed (Resume Signals)


Channel: control-feed


Source: API (via dashboard "Resume" button)


Subscriber: Executor


Used to resume trading after a panic brake


Hot Config Reloading


Channel: config-feed


Used to notify the Executor when settings have been changed (e.g. latency cap, personality mode)


Cache Layer (optional)


Stores recent trade outcomes, mode state, and balances for fast access


TTL is short (typically 60 seconds)


Benefits of Redis Integration:
Decouples producers from consumers


Ensures rapid delivery of critical control signals


Reduces load on PostgreSQL for fast-moving data


Failure Behavior:
All messages are fire-and-forget


If Redis is unavailable:


Executor uses stale config


Spread feed pauses


Resume signal will not be received



19.2 PostgreSQL Schema
PostgreSQL acts as the system of record. It stores all durable business data used for historical analysis, configuration, and audit.
Core Tables:
trades
 Stores all completed trade events.
 Refer to Section 13.1 for full schema.


near_misses
 Rejected trade opportunities and reasons for failure.
 Refer to Section 8.4 for schema.


settings
 Stores all operator-defined config values (e.g. thresholds, mode, caps).
 Example:


Key
Value
personality_mode
AUTO
loss_cap_pct
5
max_latency_ms
250




sweep_log (optional)
 Logs when cold wallet sweeps are performed:


Profit amount


Time


Destination address


Trigger type


audit_log (optional)
 Records user interactions (e.g. settings change, resume button clicks)


Database Configuration:
Version: PostgreSQL 16+


User: arbuser


DB: prism_db


Recommended: Use connection pooler like pgbouncer in production


Security and Backup:
Backups run nightly using pg_dump


Credentials stored via Kubernetes SealedSecrets


Read replicas optional (for analytics offloading)



19.3 Prometheus Data Model
Prometheus is used for time-series metrics ingestion across the system.
Data Structure:
Metrics are key-value pairs with timestamp


Each metric has a name and optional labels for dimension filtering


Metric Example:
cpp
CopyEdit
executor_trade_success_count{exchange="binance",pair="BTC/USDT"} 2312

Retention and Storage:
Default retention: 15 days


Data stored locally on Prometheus server (or remote long-term storage)


No SQL interface — queryable via PromQL in Grafana or API


Data Sources:
Executor


Analytics


API Gateway


AlertManager (optional)


Grafana Queries (Examples):
Rolling trade count:

 scss
CopyEdit
increase(executor_trade_success_count[1h])


Average latency per mode:

 scss
CopyEdit
avg by(mode) (executor_latency_ms)


Alert Hooking:
 Prometheus is directly tied to alerting logic described in Section 15.3
Security:
Not exposed externally without ingress proxy


Export endpoints (e.g., /metrics) limited to cluster-internal communication



Visual Placeholder Note:
 Include:
Diagram: Redis pub/sub messaging


Table view of settings table from Postgres


Grafana snapshot showing query from Prometheus


Section 20: Extensibility Hooks
 Includes:
20.1 Strategy Plug-ins


20.2 Custom Alert Channels


20.3 Liquidity-Aware Routing



20.1 Strategy Plug-ins
Prism was designed with modular execution logic. Developers can extend the trading engine by writing new arbitrage strategies and integrating them via a gRPC or internal module interface.
Existing Core Strategies:
Cross-exchange arbitrage


Triangular arbitrage within a single exchange


Adding a New Strategy (e.g., Time-Based Arbitrage):
Approach 1: Internal Plugin (Java Executor)
Add a new strategy class that implements a common interface:

 java
CopyEdit
public interface StrategyModule {
    List<SpreadOpportunity> evaluate(List<MarketData> data);
}


Register it in the Executor’s evaluation loop:

 java
CopyEdit
modules.add(new TimeLagArbitrageModule());


Approach 2: External Module via gRPC
Write the strategy in any language (e.g., Rust, Python, Go)


Expose a gRPC server with method:

 scss
CopyEdit
EvaluateOpportunities(MarketDataRequest) returns (OpportunityResponse)


Executor service will call this via stub and process returned opportunities


Benefits of Modular Approach:
Rapid strategy prototyping


Can run A/B tests across strategies


Supports multi-language R&D


Security Consideration:
External strategy modules must be sandboxed to avoid injecting malicious data


All responses are re-validated inside the Executor before execution



20.2 Custom Alert Channels
Operators may want to receive alerts via platforms beyond the default stack (Email, Telegram, Webhook).
Supported via Webhook Bus:
AlertManager sends alert payload to one or more user-defined webhooks


Each webhook receiver can be an adapter to:


Slack


Discord


Microsoft Teams


PagerDuty


SMS gateway


Lambda function


Config Example (YAML):
yaml
CopyEdit
webhook_urls:
  - https://hooks.slack.com/...
  - https://yourcompany.pagerduty.com/api/v1/alert

Adding a New Channel Adapter:
Create a handler in alertManager.js or equivalent dispatcher


Format the payload appropriately


Implement retry with exponential backoff


Add success/failure log to audit system


Example Slack Payload:
json
CopyEdit
{
  "text": "🚨 Prism Alert: Panic Brake Triggered\nLoss: -6.2%"
}

Recommendation:
Use middleware to normalize all alert outputs (unified schema)


Use a flag in .env to toggle each channel on/off



20.3 Liquidity-Aware Routing
This feature is planned for future releases. It allows the executor to intelligently route orders not just based on edge but also based on liquidity profiles of each venue.
Problem Being Solved:
Some exchanges have lower fees but insufficient depth


Trades fail or slippage is excessive because order books are thin


Design Proposal:
Liquidity Map Generator:


Continuously score exchanges by average book depth for top pairs


Store metrics like:


depth_at_0.1%


avg slippage


fill rate


Routing Weight Function:


Instead of choosing best edge blindly:

 java
CopyEdit
double score = netEdge * liquidityFactor - slippageEstimate;


Executor picks the best pair of exchanges based on score


Integration:


Runs alongside RiskFilter


Tracked via new metric: liquidity_weighted_score


Future Enhancements:


Integrate with market-making APIs (e.g., Hummingbot)


Use ML to learn which venues work best at what size


Fallback:
If liquidity data is missing, revert to default best-edge logic


Benefits:
Avoids failed trades


Reduces execution costs


Improves success rate and win rate



Visual Placeholder Note:
 Include:
Flowchart showing plugin architecture and gRPC integration


JSON sample of alert being routed to Slack + PagerDuty


Graph: liquidity score vs slippage by exchange


Section 21: Security & Compliance
 Includes:
21.1 TLS and Endpoint Protection


21.2 AML + CGT Compliance


21.3 Risk Reduction Features



21.1 TLS and Endpoint Protection
Prism Arbitrage is designed to operate securely on internal networks, but it includes full support for TLS encryption and API hardening when deployed in environments with external access.
TLS Setup:
All public-facing services (API, Dashboard) support HTTPS


TLS certificates are managed by Kubernetes ingress (e.g. NGINX or Traefik) using:


Let’s Encrypt for free auto-renewing certs (via Cert-Manager)


Self-signed certificates for private deployments


Security Best Practices:
JWT Tokens used for authentication; bearer tokens required for all API access


Rate limiting can be added via ingress controller to prevent abuse


CORS Policies enforced to limit cross-origin requests


Static file serving is sandboxed within the API Gateway (no root access exposure)


Read-only replicas recommended for dashboard access if publicly exposed


Ingress Configuration Example (TLS):
yaml
CopyEdit
tls:
  - hosts:
      - prism.yourdomain.com
    secretName: prism-tls-secret

Private Network Deployment (default):
Platform runs behind VPN or isolated LAN


Only dashboard and operator APIs are exposed


Metrics and internal APIs are cluster-internal only



21.2 AML + CGT Compliance
The platform supports features that simplify compliance with Anti-Money Laundering (AML) and Capital Gains Tax (CGT) regulations in the UK and EU.
AML-Friendly Logging:
Every trade, near miss, and balance snapshot is logged with:


Timestamp


Counterparty (exchange)


Asset


Size and price


Execution latency


These are exportable to .csv or .json for audit review


CGT Pooling Rules (UK):
Prism tracks asset acquisition prices and disposal values


FIFO or pooled accounting rules can be exported via database views


Trade logs are compatible with CGT calculation software


KYC/Exchange Integration:
The platform assumes all trading accounts are KYC-verified via exchange


Wallet addresses used for cold sweeps can be whitelisted for traceability


Annual Report Export (Planned):
Will generate a ZIP archive including:


Trade ledger


Sweep log


NAV snapshot history


Summary PnL statement


User Responsibility:
Prism does not perform tax filing


Data is designed to make filing easier by operators or accountants



21.3 Risk Reduction Features
The system is equipped with multiple layers of protection to reduce systemic, market, and operational risk.
1. Per-Coin Exposure Cap
Limits capital allocated to any single asset (e.g., 10% NAV max)


Enforced in the Executor before every trade


2. Panic Brakes
Automatically pause trading on:


Excess daily losses


Latency threshold breach


Win rate drop below configured minimum


3. Cold Wallet Sweeps
Realized profit is secured via automated transfer out of exchanges


Reduces exposure to exchange hacks or insolvency


4. TLS Everywhere
Internal API communication encrypted via service mesh (optional)


External communication via HTTPS with certificate rotation


5. GitHub Branch Protection & CI
No untested or insecure code can be merged or deployed


Pre-push hook blocks local commits if tests fail


6. Secrets Handling with SealedSecrets
Secrets encrypted at rest and in-transit


No raw API keys ever committed to version control


7. Logging and Audit Trail
All key actions logged:


Resume/pause actions


Settings changes


Sweeps and mode switches


Logs stored in PostgreSQL or flat files (for cold storage export)


8. Optional Multi-Signature Sweep Control
Cold wallet sweep can be configured to require human sign-off or dual operator confirmation



Visual Placeholder Note:
 Include:
Diagram of TLS ingress + Kubernetes service protection


Screenshot of exportable trade log CSV


Summary chart: active protections (caps, brakes, TLS, sweeps)


Section 22: Operator Playbook
 Includes:
22.1 Daily Checklist


22.2 Manual Resume from Panic


22.3 Safe Config Updates

22.1 Daily Checklist
Operators are responsible for verifying system health, ensuring risk controls are active, and responding to alerts. The following checklist should be reviewed at the beginning of each trading session.
Operator Daily Routine:
Login to Dashboard


Confirm successful access to the web UI


Verify JWT session token is valid


Check System Status Indicators


Trading mode (AUTO, REALISTIC, AGGRESSIVE)


Panic brake state (should be “Active”)


Execution latency chart


Win rate and equity curve


Review Alerts (Email / Telegram / Webhook)


Look for any triggered brakes, sweep notices, or unusual behavior


Acknowledge and record events in internal logs if required


Check Sweep and Profit Tracker


Look for recent cold wallet sweep log


Confirm cumulative PnL is tracking correctly


Take manual snapshot if auto-sweep is off


Inspect Recent Trades


Visit Analytics tab in dashboard


Review at least 5 recent trades:


Was latency acceptable?


Were trades successful?


Was position sizing appropriate?


Export Logs (Optional)


Run export of trades and near_misses if daily reports are required


Optionally share CSV with compliance team


Respond to Outstanding Actions


If system is paused, confirm reason


If resume is needed, follow Section 22.2



22.2 Manual Resume from Panic
When the system halts due to a triggered panic brake, operator action is required to resume trading. This is a controlled process to avoid accidental restarts during unsafe market conditions.
When You’ll See This:
Large losses (> loss cap %)


Excessive latency (> threshold)


Sustained low win rate (< min rate)


How to Resume Safely:
Open Dashboard


A red banner will display: “Trading Paused — Panic Brake Triggered”


Review Cause


Click banner for reason: loss %, latency, or win rate


Ensure conditions have normalized (use metrics tab)


Press “Resume Trading” Button


Confirms you’ve reviewed system status


Sends Redis signal (resume → control-feed)


Monitor Executor Logs


Confirm system received resume signal:

 csharp
CopyEdit
[RESUME SIGNAL RECEIVED] Resuming trade evaluation


No trades should execute until next valid opportunity is published


Confirm Resume Worked


Dashboard banner disappears


Trade counter begins ticking again (within 1–5 minutes)


If Resume Fails:
Executor logs warning


Possible causes:


Redis failure


Residual panic conditions not cleared


Config sync delay



22.3 Safe Config Updates
Operators can modify runtime settings directly from the dashboard or API without restarting services. These changes are hot reloaded and take effect immediately.
Editable Settings (Live):
Personality mode (AUTO, AGGRESSIVE, REALISTIC)


Net edge threshold


Maximum latency


Per-coin NAV cap


Daily loss cap


Cold sweep cadence


Steps to Update via Dashboard:
Navigate to Settings tab


Modify value using sliders or input fields


Click Save Settings


Watch for confirmation message:


 Settings updated successfully



System logs update:

 csharp
CopyEdit
[SETTINGS] Updated: max_latency_ms from 250 → 200


Steps to Update via API:
http
CopyEdit
POST /api/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "personality_mode": "REALISTIC",
  "loss_cap_pct": 4
}

Change Best Practices:
Avoid aggressive mode unless volatility is high


Don’t reduce net edge threshold below 0.002 unless monitored closely


Always verify latency chart before raising latency ceiling


Only enable daily sweeps if funds move > £5,000 frequently


Rollback:
Use version-controlled settings.json to restore baseline


Or manually re-enter values from previous known-safe state



Visual Placeholder Note:
 Include:
Screenshot of Settings panel with sliders


Resume button in panic state UI


Operator checklist in printable format (1-pager)


Section 23: Troubleshooting & Recovery
 Includes:
23.1 Helm Rollback


23.2 DB Backup and Restore


23.3 Debugging Panic



23.1 Helm Rollback
When a new deployment introduces a breaking change or unstable behavior, you can roll back to a previous version using Helm.
Rollback Steps:
List All Release Revisions

 bash
CopyEdit
helm history prism-arbitrage
 Output Example:

 yaml
CopyEdit
REVISION  UPDATED                     STATUS     CHART          APP VERSION
1         2025-07-01 09:00:00        deployed   prism/0.1.0     v1.0.0
2         2025-07-03 13:45:00        deployed   prism/0.1.1     v1.0.1


Rollback to Known Good Revision

 bash
CopyEdit
helm rollback prism-arbitrage 1


Verify Rollback

 bash
CopyEdit
kubectl get pods
kubectl get events


Check Version in Dashboard Footer


Confirms UI build hash (e.g., v1.0.0) matches previous stable version


Rollback Notes:
Helm only reverts manifests, not external DB schemas


If DB migrations were part of deployment, ensure they are compatible with rollback


You may need to restart pods if rollout stalls



23.2 DB Backup and Restore
Backing up PostgreSQL regularly ensures trade logs, settings, and user activity are never lost.
Recommended Tools:
pg_dump (native CLI)


pg_restore (for compressed backups)


Backup Procedure:
Dump DB to File

 bash
CopyEdit
pg_dump -U arbuser -F c prism_db > backup_2025-07-10.dump


Optional: Schedule Daily via Cron
 Example cron job (inside container or host):

 pgsql
CopyEdit
0 0 * * * /usr/bin/pg_dump -U arbuser -F c prism_db > /var/backups/prism_$(date +\%F).dump


Encrypt Backup (Optional)

 bash
CopyEdit
gpg -c backup_2025-07-10.dump


Restore Procedure:
Create Clean Target DB

 bash
CopyEdit
createdb -U arbuser prism_restore


Restore from Dump

 bash
CopyEdit
pg_restore -U arbuser -d prism_restore backup_2025-07-10.dump


Point API and Executor at New DB (if needed)


Best Practices:
Store backup files off-server (cloud or NAS)


Rotate and prune old backups weekly/monthly


Never restore into a live production DB without validation



23.3 Debugging Panic
When the system enters panic mode, it is due to a triggered safety brake. Operators must diagnose the root cause before resuming.
Step-by-Step Checklist:
Check Dashboard Panic Banner


Shows reason: latency, loss, or win rate


Inspect Executor Logs

 bash
CopyEdit
kubectl logs deploy/executor
 Look for:

 bash
CopyEdit
[PANIC BRAKE TRIGGERED] Reason: daily loss cap exceeded


Verify Metrics via Grafana or CLI


Daily PnL chart


Rolling latency chart


Win rate panel


Check Redis Status

 bash
CopyEdit
redis-cli ping


Manually Trigger Resume to Test

 bash
CopyEdit
curl -X POST http://api.local/resume -H "Authorization: Bearer <token>"


Verify Resume Trigger Worked


Logs should say: [RESUME SIGNAL RECEIVED]


Trade loop restarts


If Resume Fails:


Confirm Redis control-feed channel is live


Look for stale values in settings (e.g., bad threshold)


Validate that Executor pod is ready


Last Resort: Pod Restart

 bash
CopyEdit
kubectl rollout restart deploy/executor


Common Causes of Panic:
Thin liquidity (DEX trades failing)


Network jitter increasing latency


Poor market conditions leading to sustained loss


Accidental low threshold (e.g., 0.001 net edge)


Prevention Tips:
Always use AUTO mode unless volatility is known


Monitor latency charts throughout the day


Review logs before increasing aggressiveness



Visual Placeholder Note:
 Include:
Screenshot of panic banner and diagnostic log output


Flowchart of panic → alert → investigation → resume


Sample cron entry for DB backup


Section 24: Release Management
 Includes:
24.1 Release Workflow


24.2 SBOM Uploads


24.3 Production Checklist



24.1 Release Workflow
Prism uses a batch-tagged release system built on GitHub Actions. Each major change or stable feature group is tagged and packaged into a versioned release.
Release Naming Convention:
Batches: batch-4-complete, batch-10-complete


Stable versions: v1.0.0, v1.1.0-beta, etc.


Git Workflow:
Ensure main branch is up to date:

 bash
CopyEdit
git checkout main
git pull origin main


Tag the current commit:

 bash
CopyEdit
git tag batch-10-complete
git push origin batch-10-complete


GitHub Actions triggers release pipeline:


Builds container images


Runs full CI suite (tests, security scans, SBOM)


Uploads artifacts to GitHub


Generates changelog section


Create a GitHub release (optional manual step):


Click "Create Release" from tag


Title it e.g. "Batch 10 – Production Ready"


Paste latest changelog section


Example Changelog Block:
markdown
CopyEdit
## [Batch 10] - 2025-07-11

### Added
- Xeon deployment script
- Helm rollback documentation
- GitHub release packaging

### Fixed
- API metrics format consistency
- Webhook retry on error


24.2 SBOM Uploads
Each release includes Software Bill of Materials (SBOMs) generated using Syft, which enumerate all container dependencies.
Why SBOMs Matter:
Required for enterprise / regulated environments


Enables dependency auditing and CVE traceability


Improves supply chain transparency


Process:
After Podman image builds, run:

 bash
CopyEdit
syft dashboard:latest -o json > sbom-dashboard.json
syft api:latest -o json > sbom-api.json


GitHub CI auto-uploads these to the release:

 yaml
CopyEdit
- name: Upload SBOMs to GitHub Release
  uses: softprops/action-gh-release@v1
  with:
    files: |
      sbom-dashboard.json
      sbom-api.json


SBOMs appear in the GitHub release page under "Assets"


SBOM Format:
JSON (CycloneDX / SPDX optional)


Lists:


All packages (Node, Python, Java)


Hashes


Source URLs


Licenses



24.3 Production Checklist
Before tagging a release for production, confirm that all components pass quality and safety thresholds.
Operator Production Checklist:
✅ All unit/integration tests passing
 ✅ Panic brake manually tested
 ✅ CI Trivy scan: no high-severity CVEs
 ✅ Static analysis passes: ESLint, Flake8, Checkstyle
 ✅ Helm templates validated:
bash
CopyEdit
kubectl apply --dry-run=client -f infra/k8s/

✅ Metrics endpoints exposed and scrape-able
 ✅ Dashboard UI builds correctly
 ✅ SBOMs attached to GitHub release
 ✅ README, changelog, and version number updated
 ✅ Docker .dockerignore excludes node_modules, .env, logs
Optional Tasks:
Final review of changelog (CHANGELOG.md)


Verify cold wallet test transfer still works


Deploy to staging environment (if used)


Ping alert webhook with /alert/test payload


Post-Release Recommendations:
Monitor latency and PnL charts for 2 hours


Keep GitHub release notes up to date


Freeze further changes for 24–48 hours unless hotfix required



Visual Placeholder Note:
 Include:
Screenshot of GitHub release artifact panel


Changelog block formatting guide


Table: release version → batch number → date
Section 25: Glossary of Terms
This section defines all core technical, financial, and system terms used across Prism Arbitrage documentation, UI, API, and logs.
Term
Definition
Net Edge
Profit margin (%) after fees, latency, and slippage. Must exceed threshold to execute.
Gross Edge
Unadjusted spread between buy and sell prices before any cost deductions.
Slippage
The difference between expected price and actual fill price.
Spread Opportunity
A detected pair of trades (buy/sell) that could result in profit.
TradeLogger
Module that writes completed trades to the trades table.
NearMissLogger
Records rejected trade opportunities and their reasons (e.g. low edge).
Panic Brake
A safety mechanism that halts trading when key thresholds are breached.
Circuit Breaker
A higher-order global pause mechanism based on win rate or repeated panic triggers.
Resume Signal
Message sent via Redis to instruct the Executor to resume trading.
Latency
Time between opportunity detection and trade execution (in milliseconds).
IOC Order
Immediate or Cancel — fills instantly or cancels to avoid hanging orders.
Personality Mode
Execution strategy: AUTO, REALISTIC, AGGRESSIVE — affects thresholds and bet sizing.
Cold Wallet Sweep
Automated transfer of realized profit from hot exchange wallets to cold storage.
ProfitTracker
Tracks cumulative realized PnL in memory and triggers sweeps if thresholds met.
SBOM
Software Bill of Materials — inventory of all packages in a release.
SealedSecret
Kubernetes secret encrypted using a controller public key — safe for version control.
Redis
In-memory pub/sub and cache service used for spreads, config updates, control signals.
Prometheus
Time-series monitoring system used to scrape, store, and alert on metrics.
Grafana
UI dashboard for visualizing Prometheus metrics in real time.
Webhook
Custom HTTP endpoint that receives alert payloads from AlertManager.
Jest
JavaScript testing framework for UI and Node.js components.
PyTest
Python testing framework used in analytics module.
Checkstyle
Static code analysis tool used in Java Executor.
gRPC
Protocol for RPC between services — used for plugging in external strategies.
Helm
Kubernetes deployment package manager used for installing and upgrading Prism services.
Trivy
Security scanner that detects known CVEs in images and dependencies.
Syft
Tool used to generate SBOMs from Docker or Podman images.
JWT
JSON Web Token — used for authenticating API and UI users.
NAV
Net Asset Value — total capital deployed or under management.
Win Rate
Proportion of executed trades that resulted in profit.
Hit Ratio
Percentage of valid opportunities that were successfully traded.
Sharpe Ratio
Risk-adjusted return metric = (Return - Risk-Free Rate) / Std Dev of Return.


Visual Placeholder Note:
 Include:
Downloadable glossary PDF


Highlighted terms with links back to main guide sections


Sidebar for term lookups in Google Docs


