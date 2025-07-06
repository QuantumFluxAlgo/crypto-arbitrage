import argparse
import os
import psycopg2
import numpy as np
from tensorflow.keras.models import load_model


def get_connection():
    """Create a connection to Postgres using env vars."""
    return psycopg2.connect(
        host=os.environ.get("PGHOST", "localhost"),
        port=int(os.environ.get("PGPORT", 5432)),
        dbname=os.environ.get("PGDATABASE", "arbdb"),
        user=os.environ.get("PGUSER", "postgres"),
        password=os.environ.get("PGPASSWORD", ""),
    )


def fetch_features(conn, limit):
    """Fetch features and labels from the latest trades."""
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT net_edge, slippage, volatility, latency, label
            FROM training_features
            ORDER BY id DESC
            LIMIT %s
            """,
            (limit,),
        )
        rows = cur.fetchall()
    features = np.array([r[:-1] for r in rows], dtype=np.float32)
    labels = np.array([r[-1] for r in rows], dtype=np.float32)
    return features.reshape((features.shape[0], 1, features.shape[1])), labels


def load_models(base_dir):
    prod_path = os.path.join(base_dir, "model.h5")
    shadow_path = os.path.join(base_dir, "model_shadow.h5")
    prod_model = load_model(prod_path)
    shadow_model = load_model(shadow_path)
    return prod_model, shadow_model


def evaluate(prod_preds, shadow_preds, labels):
    delta = float(np.mean(shadow_preds - prod_preds))
    prod_acc = float(np.mean((prod_preds.flatten() > 0.5) == labels))
    shadow_acc = float(np.mean((shadow_preds.flatten() > 0.5) == labels))
    corr = float(np.corrcoef(prod_preds.flatten(), shadow_preds.flatten())[0, 1])
    return delta, prod_acc, shadow_acc, corr


def main():
    parser = argparse.ArgumentParser(description="Compare prod vs shadow model")
    parser.add_argument("--limit", type=int, default=1000,
                        help="Number of recent trades to use")
    args = parser.parse_args()

    with get_connection() as conn:
        X, y = fetch_features(conn, args.limit)

    base_dir = os.path.dirname(os.path.dirname(__file__))
    prod_model, shadow_model = load_models(base_dir)

    prod_preds = prod_model.predict(X, verbose=0)
    shadow_preds = shadow_model.predict(X, verbose=0)

    delta, prod_acc, shadow_acc, corr = evaluate(prod_preds, shadow_preds, y)

    print(f"avg delta: {delta:.6f}")
    print(f"prod accuracy: {prod_acc:.4f}")
    print(f"shadow accuracy: {shadow_acc:.4f}")
    print(f"prediction correlation: {corr:.4f}")


if __name__ == "__main__":
    main()
