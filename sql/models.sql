CREATE TABLE IF NOT EXISTS model_metadata (
    id SERIAL PRIMARY KEY,
    version_hash TEXT NOT NULL,
    trained_at TIMESTAMP NOT NULL,
    sharpe REAL,
    win_rate REAL,
    val_loss REAL,
    notes TEXT,
    changed_by TEXT,
    change_type TEXT,
    source_ip TEXT
);
