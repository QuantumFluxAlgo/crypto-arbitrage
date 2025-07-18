# Analytics Service

This service provides trade analytics and optional machine learning models for signal generation.

## GPU configuration

TensorFlow will automatically utilise a GPU if available in the runtime environment.
To enable GPU support:

1. Install the appropriate CUDA drivers on the host.
2. Build the container with GPU capabilities (e.g. using a CUDA-enabled base image).
3. Run the container with `--gpus all` when using Docker or the equivalent option in your orchestrator.

No `GPU_ENABLED` environment variable is required. The service falls back to CPU execution when no GPU is detected.
