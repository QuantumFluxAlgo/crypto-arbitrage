import argparse
import csv
import os
import psycopg2
import numpy as np


def get_connection():
    """Create a connection to Postgres using env vars."""
    return psycopg2.connect(
        host=os.environ.get("PGHOST", "localhost"),
        port=int(os.environ.get("PGPORT", 5432)),
        dbname=os.environ.get("PGDATABASE", "arbdb"),
        user=os.environ.get("PGUSER", "postgres"),
        password=os.environ.get("PGPASSWORD", ""),
    )


def fetch_rows(conn, limit):
    """Return recent rows from training_features table."""
    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM training_features ORDER BY id DESC LIMIT %s", (limit,)
        )
        rows = cur.fetchall()
        columns = [d[0] for d in cur.description]
    return columns, rows


def export_csv(columns, rows):
    with open("export.csv", "w", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(columns)
        writer.writerows(rows)


def export_npz(columns, rows):
    data = np.array(rows)
    np.savez("features.npz", columns=columns, data=data)


def main():
    parser = argparse.ArgumentParser(description="Export training features")
    parser.add_argument("--limit", type=int, default=1000,
                        help="Number of recent rows to fetch")
    parser.add_argument("--output", choices=["csv", "npz"], default="csv",
                        help="Output format")
    args = parser.parse_args()

    with get_connection() as conn:
        columns, rows = fetch_rows(conn, args.limit)

    if args.output == "csv":
        export_csv(columns, rows)
    else:
        export_npz(columns, rows)


if __name__ == "__main__":
    main()
