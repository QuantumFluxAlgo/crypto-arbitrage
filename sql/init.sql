CREATE TABLE labels (
    id INT PRIMARY KEY,
    name TEXT NOT NULL
);

INSERT INTO labels (id, name) VALUES
    (0, 'not_profitable'),
    (1, 'profitable');

CREATE TABLE training_features (
    id SERIAL PRIMARY KEY,
    pair TEXT NOT NULL,
    net_edge NUMERIC NOT NULL,
    slippage NUMERIC NOT NULL,
    volatility NUMERIC NOT NULL,
    latency NUMERIC NOT NULL,
    label INT NOT NULL REFERENCES labels(id),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE cgt_audit (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    asset TEXT NOT NULL,
    side TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    price NUMERIC NOT NULL,
    cost_basis NUMERIC,
    gain NUMERIC
);

-- Table storing executed trades for auditing
CREATE TABLE trades (
    id SERIAL PRIMARY KEY,
    buy_exchange TEXT NOT NULL,
    sell_exchange TEXT NOT NULL,
    pair TEXT NOT NULL,
    net_edge NUMERIC NOT NULL,
    pnl NUMERIC NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table storing filtered opportunities for later analysis
CREATE TABLE near_misses (
    id SERIAL PRIMARY KEY,
    buy_exchange TEXT NOT NULL,
    sell_exchange TEXT NOT NULL,
    pair TEXT NOT NULL,
    gross_edge NUMERIC NOT NULL,
    net_edge NUMERIC NOT NULL,
    reason TEXT NOT NULL,
    latency_ms INTEGER NOT NULL,
    round_trip_latency_ms INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Logs user actions for compliance auditing
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id TEXT,
    action TEXT NOT NULL,
    payload JSONB
);

-- Records cold wallet sweeps performed by the executor
CREATE TABLE sweep_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    amount NUMERIC NOT NULL,
    destination TEXT NOT NULL,
    trigger TEXT
);
