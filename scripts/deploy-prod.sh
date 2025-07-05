#!/bin/bash
# deploy-prod.sh - Provision and deploy the production K8s cluster
#
# Usage: sudo ./deploy-prod.sh
#
# This script installs container runtime and Kubernetes tooling, initializes a
# single-node cluster via kubeadm, then deploys project resources.

set -euo pipefail

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log "Updating package index"
apt-get update -y

log "Installing containerd and podman"
apt-get install -y containerd podman

log "Installing Kubernetes components"
apt-get install -y apt-transport-https ca-certificates curl
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
cat <<EOFAPT >/etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOFAPT
apt-get update -y
apt-get install -y kubelet kubeadm kubectl

log "Installing Helm"
curl https://baltocdn.com/helm/signing.asc | apt-key add -
apt-get install -y helm

log "Initializing Kubernetes cluster"
kubeadm init --pod-network-cidr=10.244.0.0/16

log "Configuring kubectl for root"
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config

log "Deploying flannel CNI"
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml

log "Applying NVIDIA GPU plugin"
kubectl apply -f "$ROOT_DIR/infra/k8s/gpu-plugin.yaml"

log "Deploying Kubernetes manifests"
for manifest in "$ROOT_DIR/infra/k8s"/*.yaml; do
    [ -f "$manifest" ] || continue
    kubectl apply -f "$manifest"
done

log "Deploying Helm chart"
helm upgrade --install arb "$ROOT_DIR/infra/helm" --namespace arb --create-namespace

log "Production deployment complete"
