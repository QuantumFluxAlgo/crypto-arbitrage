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
