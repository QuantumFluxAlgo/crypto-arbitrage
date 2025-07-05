#!/bin/bash
# ops-tools.sh - Operator CLI tools
#
# Usage: ./ops-tools.sh <command>
#
# Commands:
#   start   Deploy services with Helm
#   stop    Tear down services
#   logs    Fetch executor logs
#   status  Show pod health
#   backup  Perform Postgres backup using pg_dump
#
# Example:
#   ./ops-tools.sh start

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NAMESPACE="arbitrage"
# Directory containing Helm charts (can be overridden via CHART_DIR env var)
CHART_DIR="${CHART_DIR:-$ROOT_DIR/infra/helm}"

usage() {
  grep '^#' "$0" | cut -c 3-
  exit 1
}

[[ $# -lt 1 ]] && usage
cmd="$1"

case "$cmd" in
  start)
    if [[ ! -d "$CHART_DIR" ]]; then
      echo "Error: chart directory '$CHART_DIR' not found" >&2
      exit 1
    fi
    helm upgrade --install arb-charts "$CHART_DIR" --namespace "$NAMESPACE"
    ;;
  stop)
    helm uninstall arb-charts --namespace "$NAMESPACE"
    ;;
  logs)
    kubectl logs deployment/executor -n "$NAMESPACE" --tail=100
    ;;
  status)
    kubectl get pods -n "$NAMESPACE"
    ;;
  backup)
    pod=$(kubectl get pods -n "$NAMESPACE" -l app=postgres -o jsonpath='{.items[0].metadata.name}')
    kubectl exec -n "$NAMESPACE" "$pod" -- pg_dump -U postgres -d arbdb > "$ROOT_DIR/postgres-backup.sql"
    ;;
  *)
    usage
    ;;
esac
