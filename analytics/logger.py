import logging
import logging.handlers
import os
import urllib.parse

level = os.getenv("LOG_LEVEL", "INFO").upper()
log_dir = os.getenv("LOG_DIR", "/var/log/prism-arbitrage")
os.makedirs(log_dir, exist_ok=True)
handlers = [
    logging.StreamHandler(),
    logging.FileHandler(os.path.join(log_dir, "analytics.log")),
]
forward_url = os.getenv("LOKI_URL") or os.getenv("LOG_FORWARD_URL")
if forward_url:
    parsed = urllib.parse.urlparse(forward_url)
    handlers.append(
        logging.handlers.HTTPHandler(parsed.netloc, parsed.path, method="POST")
    )

logging.basicConfig(level=level, format="%(asctime)s %(levelname)s %(message)s", handlers=handlers)
logger = logging.getLogger("analytics")
