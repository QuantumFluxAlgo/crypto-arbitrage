export default {
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
