"""Entry point for the analytics service."""

import os
import sys
from .logger import logger

from .app import app, model


def main() -> None:
    """Start the Flask analytics service."""
    if model is None:
        logger.error("Failed to load model. Exiting.")
        sys.exit(1)

    debug = os.getenv("FLASK_ENV") != "production"
    app.run(host="0.0.0.0", port=5000, debug=debug)


if __name__ == "__main__":
    main()
