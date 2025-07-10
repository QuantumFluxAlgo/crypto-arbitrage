# Phase 2: Server Deployment Guide (Proxmox Host to On-Prem Kubernetes)

**Goal:**
Deploy the Prism Arbitrage platform into an on-premise production server running as a VM under Proxmox 8.4.1. This process includes VM setup, Ubuntu provisioning, Kubernetes installation, Helm deployment, and all necessary runtime components (Redis, GPU, SealedSecrets, and monitoring stack).

---

## 1. Provision Ubuntu VM on Proxmox

### Step 1: Create a New VM

* Log into the Proxmox web UI
* Select the node and click "Create VM"
* Configuration:

  * Name: `prism-prod`
  * OS: Ubuntu 22.04 LTS
  * Machine: `q35`, BIOS: `OVMF (UEFI)`
  * Disk: 150–200GB SSD-backed
  * CPU: 10 cores (Xeon)
  * RAM: 32–64 GB
  * Network: `vmbr0`, model `VirtIO`
* Complete VM setup and start the instance

> Note: Enable SR-IOV, VT-d passthrough in BIOS if GPU access is needed.

---

## 2. SSH Access to VM

From local machine:

```bash
ssh root@<vm_ip_address>
```

Use Proxmox console or `ip a` on the VM to find the IP address.

---

## 3. Base Ubuntu Server Setup

Run the following in the VM:

```bash
apt update && apt upgrade -y
apt install -y curl git gnupg2 lsb-release ca-certificates \
    apt-transport-https software-properties-common \
    net-tools unzip jq nfs-common htop
```

---

## 4. Install NVIDIA Drivers (Dry-Run Compatible)

```bash
ubuntu-drivers devices
ubuntu-drivers autoinstall
reboot
```

After reboot:

```bash
nvidia-smi
```

Should display Tesla P4. If not, verify Proxmox passthrough setup.

---

## 5. Install Kubernetes

```bash
apt install -y apt-transport-https ca-certificates curl
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | \
    gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" \
    > /etc/apt/sources.list.d/kubernetes.list

apt update
apt install -y kubelet kubeadm kubectl
```

---

## 6. Initialize Kubernetes Cluster

```bash
kubeadm init --pod-network-cidr=10.244.0.0/16
```

Post-init config:

```bash
mkdir -p $HOME/.kube
cp /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config
```

Install Flannel CNI:

```bash
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

---

## 7. Install Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

---

## 8. Install SealedSecrets Controller

```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.23.0/controller.yaml
```

---

## 9. Install NVIDIA Device Plugin for Kubernetes

```bash
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)

curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | sudo apt-key add -

curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list \
  | sudo tee /etc/apt/sources.list.d/nvidia-container.list

apt update
apt install -y nvidia-container-toolkit
systemctl restart containerd

kubectl apply -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/v0.12.3/nvidia-device-plugin.yml
```

Confirm:

```bash
kubectl describe node <your-node-name> | grep nvidia.com/gpu
```

---

## 10. Clone Prism Arbitrage Repository

```bash
git clone https://github.com/prism-arbitrage/crypto-arbitrage.git
cd crypto-arbitrage
git checkout main
```

Confirm you see:

* `infra/helm`
* `.env.example` files
* `api/`, `dashboard/`, `executor/`, `analytics/`

---

## 11. Generate and Seal Secrets

Example secret YAML:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
  namespace: default
type: Opaque
stringData:
  BINANCE_KEY: "dummy"
  BINANCE_SECRET: "dummy"
  SMTP_USER: "alerts@example.com"
  SMTP_PASS: "changeme"
```

Seal and apply:

```bash
kubeseal < secret.yaml > sealed-secret.yaml --format yaml
kubectl apply -f sealed-secret.yaml
```

---

## 12. Deploy Using Helm

```bash
cd infra/helm
helm install prism-arbitrage . --namespace default
```

To upgrade:

```bash
helm upgrade prism-arbitrage . --namespace default
```

Rollback:

```bash
helm rollback prism-arbitrage <revision>
```

---

## 13. Configure TLS Ingress

Apply the Kubernetes ingress manifest to expose the API and dashboard over HTTPS.

```bash
kubectl apply -f infra/k8s/ingress.yaml
```

Ensure the TLS certificate secret `prism-tls-secret` exists in the cluster so the
ingress controller can terminate HTTPS traffic.

Validate:

```bash
kubectl get pods
kubectl get svc
```

---

## 14. Confirm Runtime Health

```bash
kubectl get pods -o wide
kubectl logs deploy/api
kubectl logs deploy/executor
```

Port-forward (optional):

```bash
kubectl port-forward svc/api 8080:8080
kubectl port-forward svc/dashboard 3000:3000
```

---

## 15. Optional Monitoring Setup

Add repos:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

---

## 16. Final Deployment Checklist

* [ ] Ubuntu VM provisioned on Proxmox
* [ ] Kubernetes initialized and accessible
* [ ] Helm and SealedSecrets installed
* [ ] Tesla P4 GPU detected and usable via device plugin
* [ ] Prism Arbitrage deployed via Helm chart
* [ ] Secrets sealed and available to workloads
* [ ] Dashboard accessible via port-forward or ingress
* [ ] All core pods (`api`, `dashboard`, `executor`, `analytics`) healthy

