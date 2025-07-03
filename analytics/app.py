from flask import Flask, request, jsonify
from dotenv import load_dotenv
import logging
import os

# Load environment variables from a .env file if present
load_dotenv()

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.before_request
def log_request():
    logger.info(f"{request.method} {request.path}")

@app.route('/ping')
def ping():
    return jsonify(pong=True)

if __name__ == '__main__':
    # Enable auto-reload in development mode
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug)
