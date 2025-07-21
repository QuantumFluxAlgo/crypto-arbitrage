import logging
import os

level = os.getenv("LOG_LEVEL", "INFO").upper()
log_dir = os.getenv("LOG_DIR", "/var/log/prism-arbitrage")
os.makedirs(log_dir, exist_ok=True)
logging.basicConfig(
    level=level,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(log_dir, "analytics.log")),
    ],
)
logger = logging.getLogger("analytics")
