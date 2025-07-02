import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Analytics service started")
logger.error("Analytics service encountered an error")
