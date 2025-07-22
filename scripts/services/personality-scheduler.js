#!/usr/bin/env node
// Personality Scheduler service

require('dotenv').config();
const axios = require('axios');

const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:5000/performance';
const SETTINGS_URL = process.env.SETTINGS_URL || 'http://localhost:8080/api/settings';
const INTERVAL_MS = Number(process.env.SWITCH_INTERVAL_MS || 300000);
const VOL_THRESHOLD = Number(process.env.VOL_THRESHOLD || 1);
const WIN_THRESHOLD = Number(process.env.WIN_THRESHOLD || 0.55);
const DRY_RUN = process.env.DRY_RUN === 'true';

async function checkAndUpdate() {
  try {
    const { data } = await axios.get(ANALYTICS_URL);
    const { volatility, win_rate } = data;
    let mode = 'Realistic';
    if (volatility > VOL_THRESHOLD && win_rate >= WIN_THRESHOLD) {
      mode = 'Aggressive';
    }
    if (DRY_RUN) {
      console.log(`[DRY-RUN] would set mode to ${mode}`);
    } else {
      await axios.patch(SETTINGS_URL, { personality_mode: mode });
      console.log(`personality mode set to ${mode}`);
    }
  } catch (err) {
    console.error('[personality-scheduler] error:', err.message);
  }
}

function loop() {
  checkAndUpdate().finally(() => {
    setTimeout(loop, INTERVAL_MS);
  });
}

console.log(`Starting personality scheduler. Interval ${INTERVAL_MS} ms. Dry run: ${DRY_RUN}`);
loop();

