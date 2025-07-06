CREATE TABLE training_features (
    id SERIAL PRIMARY KEY,
    pair TEXT NOT NULL,
    net_edge NUMERIC NOT NULL,
    slippage NUMERIC NOT NULL,
    volatility NUMERIC NOT NULL,
    latency NUMERIC NOT NULL,
    label TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);
