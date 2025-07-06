import os
import psycopg2


def _get_conn():
    return psycopg2.connect(
        host=os.getenv("PGHOST", "localhost"),
        port=os.getenv("PGPORT", 5432),
        dbname=os.getenv("PGDATABASE", "arbdb"),
        user=os.getenv("PGUSER", "postgres"),
        password=os.getenv("PGPASSWORD", "")
    )


def insert_metadata(version_hash: str, sharpe: float | None = None,
                     win_rate: float | None = None,
                     val_loss: float | None = None,
                     notes: str | None = None) -> None:
    """Insert a row into the model_metadata table."""
    conn = _get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO model_metadata
                    (version_hash, trained_at, sharpe, win_rate, val_loss, notes)
                VALUES (%s, NOW(), %s, %s, %s, %s)
                """,
                (version_hash, sharpe, win_rate, val_loss, notes)
            )
    finally:
        conn.close()
