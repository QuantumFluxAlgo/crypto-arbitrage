import os
import json
import urllib.request
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
                     notes: str | None = None,
                     changed_by: str | None = None,
                     change_type: str | None = None,
                     source_ip: str | None = None) -> None:
    """Insert a row into the model_metadata table."""
    conn = _get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO model_metadata
                    (version_hash, trained_at, sharpe, win_rate, val_loss, notes, changed_by, change_type, source_ip)
                VALUES (%s, NOW(), %s, %s, %s, %s, %s, %s, %s)
                """,
                (version_hash, sharpe, win_rate, val_loss, notes, changed_by, change_type, source_ip)
            )
    finally:
        conn.close()


def send_event(version_hash: str, change_type: str, changed_by: str | None = None,
               source_ip: str | None = None, api_url: str = 'http://localhost:8080/api/models/event') -> None:
    payload = {
        'version_hash': version_hash,
        'change_type': change_type,
        'changed_by': changed_by,
        'source_ip': source_ip,
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(api_url, data=data, headers={'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass
