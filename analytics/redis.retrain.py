import argparse
import json
import redis
import numpy as np
from analytics.lstm import SpreadLSTM
from analytics.logger import logger

def fetch_spreads(host: str, port: int, key: str, limit: int = 1000) -> np.ndarray:
    """Fetch recent spread entries from Redis list or stream."""
    r = redis.Redis(host=host, port=port, decode_responses=True)
    if r.type(key) == b'stream':
        entries = r.xrevrange(key, count=limit)
        messages = [entry[1].get('data') for entry in entries if 'data' in entry[1]]
    else:
        messages = r.lrange(key, -limit, -1)
    spreads = []
    for msg in messages:
        try:
            data = json.loads(msg)
            if 'spread' in data:
                spreads.append(float(data['spread']))
            elif 'ask' in data and 'bid' in data:
                spreads.append(float(data['ask']) - float(data['bid']))
        except Exception as exc:
            logger.warning('Invalid message: %s', exc)
    return np.array(spreads, dtype=np.float32)

def prepare_sequences(spreads: np.ndarray, timesteps: int) -> tuple[np.ndarray, np.ndarray]:
    if len(spreads) <= timesteps:
        raise ValueError('Not enough spread samples')
    X, y = [], []
    for i in range(len(spreads) - timesteps):
        seq = spreads[i:i + timesteps]
        label = 1.0 if spreads[i + timesteps] > 0 else 0.0
        X.append(seq)
        y.append(label)
    X = np.array(X, dtype=np.float32).reshape(-1, timesteps, 1)
    y = np.array(y, dtype=np.float32)
    return X, y

def main():
    parser = argparse.ArgumentParser(description='Retrain LSTM using spreads from Redis')
    parser.add_argument('--host', default='localhost')
    parser.add_argument('--port', type=int, default=6379)
    parser.add_argument('--key', default='spread_log', help='Redis list or stream key')
    parser.add_argument('--limit', type=int, default=1000)
    parser.add_argument('--timesteps', type=int, default=10)
    parser.add_argument('--epochs', type=int, default=5)
    args = parser.parse_args()

    spreads = fetch_spreads(args.host, args.port, args.key, args.limit)
    if spreads.size == 0:
        raise SystemExit('No spreads retrieved from Redis')

    X, y = prepare_sequences(spreads, args.timesteps)
    model = SpreadLSTM(args.timesteps, 1)
    model.train(X, y, epochs=args.epochs)
    model.model.save('model.h5')
    logger.info('Model trained on %d samples and saved to model.h5', len(X))

if __name__ == '__main__':
    main()

