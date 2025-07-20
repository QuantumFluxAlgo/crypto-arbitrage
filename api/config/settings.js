export const settings = {
  schema_version: 1,
  sandbox_mode: process.env.SANDBOX_MODE === "true",
  canary_mode: false,
  useEnsemble: true,
  shadowOnly: false,
  ghost_mode: false,
  personality_mode: "Realistic",
  sweep_cadence: "None",
  maxLossPct: 0,
  latencyMaxMs: 250,
};

export function getExecutionMode(req) {
  const sessionMode = req?.session?.mode;
  if (sessionMode === 'live' || sessionMode === 'sandbox') {
    return sessionMode;
  }
  return settings.sandbox_mode ? 'sandbox' : 'live';
}

export default settings;
