#!/usr/bin/env node

// scripts/replay-trades.js
// Replay past trades for model testing and signal auditing

const minimist = require('minimist');
const { Pool } = require('pg');

const args = minimist(process.argv.slice(2), {
  string: ['pair', 'start', 'end'],
  alias: { pair: 'p' },
  default: { limit: 50 }
});

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'arbdb',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || ''
});

async function main() {
  const filters = [];
  const params = [];
  let idx = 1;

  if (args.pair) {
    filters.push(`pair = $${idx}`);
    params.push(args.pair);
    idx++;
  }
  if (args.start) {
    filters.push(`timestamp >= $${idx}`);
    params.push(args.start);
    idx++;
  }
  if (args.end) {
    filters.push(`timestamp <= $${idx}`);
    params.push(args.end);
    idx++;
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const sql = `SELECT buy_exchange, sell_exchange, pair, net_edge, pnl, timestamp FROM trades ${whereClause} ORDER BY timestamp DESC LIMIT $${idx}`;
  params.push(parseInt(args._[0], 10) || args.limit);

  const { rows } = await pool.query(sql, params);

  // output oldest to newest for replay purposes
  rows.reverse().forEach(row => {
    const vector = {
      ts: row.timestamp,
      pair: row.pair,
      buy: row.buy_exchange,
      sell: row.sell_exchange,
      edge: row.net_edge,
      pnl: row.pnl
    };
    console.log(JSON.stringify(vector));
  });

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
