import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_model():
    logger.info("Loading model")
    # Placeholder for model loading logic
    model = "model"
    return model


model = load_model()


def predict(data):
    logger.info("Running prediction")
    try:
        # Placeholder for prediction logic
        result = sum(data)
        logger.info("Prediction result: %s", result)
        return result
    except Exception:
        logger.error("Prediction failed", exc_info=True)
        raise
