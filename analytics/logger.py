import logging
import os

level = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=level, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("analytics")
