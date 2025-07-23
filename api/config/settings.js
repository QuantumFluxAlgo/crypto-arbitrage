// Runtime settings loaded from env and patched via API
// ExecutionMode centralizes mode names and enables dry-run enforcement
export const ExecutionMode = Object.freeze({
  LIVE: 'live',
  SANDBOX: 'sandbox',
  DRY_RUN: 'dry-run',
});

export const settings = {
  schema_version: 1,
  // SANDBOX_MODE forces sandbox trading when true
  sandbox_mode: process.env.SANDBOX_MODE === 'true',
  canary_mode: false,
  useEnsemble: true,
  shadowOnly: false,
  ghost_mode: false,
  personality_mode: "Realistic",
  sweep_cadence: "None",
  maxLossPct: parseFloat(process.env.LOSS_CAP_PCT || "0"),
  latencyMaxMs: parseFloat(process.env.LATENCY_MAX_MS || "250"),
  coinExposureLimit: parseFloat(process.env.COIN_CAP_PCT || "10"),
};

// Returns ExecutionMode for the current request.
// Used by logging such as `[DRY-RUN] Skipping cold wallet transfer`.
export function getExecutionMode(req) {
  const sessionMode = req?.session?.mode;
  if (
    sessionMode === ExecutionMode.LIVE ||
    sessionMode === ExecutionMode.SANDBOX ||
    sessionMode === ExecutionMode.DRY_RUN
  ) {
    return sessionMode;
  }
  const envMode = String(process.env.EXECUTION_MODE || '')
    .toLowerCase()
    .replace('_', '-');
  if (envMode === 'dry-run') {
    return ExecutionMode.DRY_RUN;
  }
  if (envMode === 'sandbox') {
    return ExecutionMode.SANDBOX;
  }
  if (envMode === 'live') {
    return ExecutionMode.LIVE;
  }
  return settings.sandbox_mode ? ExecutionMode.DRY_RUN : ExecutionMode.LIVE;
}

export function getControlChannel() {
  return `control-feed-${process.env.NODE_ENV || 'development'}`;
}

export default settings;
