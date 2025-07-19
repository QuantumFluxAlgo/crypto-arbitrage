#!/bin/bash
# builds.sh - Build container images for project services using Podman
#
# Usage: ./builds.sh
#
# For each service directory, this script runs `podman build` and tags the
# resulting image as `arb-<service>`.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICES=(dashboard api executor analytics)

for svc in "${SERVICES[@]}"; do
    IMAGE="arb-$svc"
    CONTEXT="$ROOT_DIR/$svc"
    echo "Building $IMAGE from $CONTEXT"
    podman build -t "$IMAGE" "$CONTEXT"
done
