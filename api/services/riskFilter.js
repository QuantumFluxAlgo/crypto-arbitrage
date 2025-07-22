let currentMode = 'Realistic';

export function setMode(mode) {
  currentMode = mode;
  console.log(`[RiskFilter] mode updated to ${mode}`);
}

export function getMode() {
  return currentMode;
}
