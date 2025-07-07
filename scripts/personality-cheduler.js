#!/usr/bin/env node

const axios = require('axios');

const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:5000/performance';
const SETTINGS_URL = process.env.SETTINGS_URL || 'http://localhost:8080/api/settings';
const INTERVAL_MS = Number(process.env.SWITCH_INTERVAL_MS || 300000);
const VOL_THRESHOLD = Number(process.env.VOL_THRESHOLD || 1);
const WIN_THRESHOLD = Number(process.env.WIN_THRESHOLD || 0.55);

async function checkAndUpdate() {
  try {
    const { data } = await axios.get(ANALYTICS_URL);
    const { volatility, win_rate } = data;
    let mode = 'Realistic';
    if (volatility > VOL_THRESHOLD && win_rate >= WIN_THRESHOLD) {
      mode = 'Aggressive';
    }
    await axios.patch(SETTINGS_URL, { personality_mode: mode });
    console.log(`updated mode to ${mode}`);
  } catch (err) {
    console.error('scheduler error:', err.message);
  }
}

checkAndUpdate();
setInterval(checkAndUpdate, INTERVAL_MS);
