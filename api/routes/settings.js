import { z } from "zod";
import logger from "../services/logger.js";
import { setMode as setRiskFilterMode } from "../services/riskFilter.js";
import { getControlChannel, getExecutionMode } from "../config/settings.js";
import { getConfigSource, loadSettingsFromRedis } from "../services/configManager.js";

export let settings = {
  schema_version: 1,
  canary_mode: false,
  useEnsemble: true,
  shadowOnly: false,
  ghost_mode: false,
  sandbox_mode: process.env.SANDBOX_MODE === "true",
  personality_mode: "Realistic",
  sweep_cadence: "None",
  maxLoss: 0,
  maxLossPct: 0,
  latencyMaxMs: 250,
  coinExposureLimit: 10,
};

export default async function settingsRoutes(app, opts) {
  const { redis } = opts;
  app.get("/settings", async (req) => ({
    ...settings,
    mode: getExecutionMode(req),
    source: getConfigSource(),
  }));

  const schema = z
    .object({
      schema_version: z.number().int().optional(),
      canary_mode: z.boolean().optional(),
      useEnsemble: z.boolean().optional(),
      shadowOnly: z.boolean().optional(),
      ghost_mode: z.boolean().optional(),
      sandbox_mode: z.boolean().optional(),
      personality_mode: z.string().optional(),
      sweep_cadence: z.string().optional(),
      maxLoss: z.number().optional(),
      maxLossPct: z.number().optional(),
      latencyMaxMs: z.number().optional(),
      coinExposureLimit: z.number().optional(),
      exposureCapPct: z.number().optional(),
      mode: z.string().optional(),
    })
    .strict();

  const validateSettings = async (req, reply) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      reply.code(400);
      return { error: "invalid settings" };
    }
    const data = result.data;
    const operator = req.user?.email || req.user?.id || req.ip;
    const mode = getExecutionMode(req);

    if (typeof data.mode === "string") {
      const modes = ["REALISTIC", "AGGRESSIVE", "AUTO"];
      if (!modes.includes(data.mode)) {
        logger.warn(
          `[SETTINGS-REJECTED] user=${operator} field=mode value=${data.mode}`
        );
        reply.code(400);
        return { error: "Invalid setting: mode" };
      }
      const map = {
        REALISTIC: "Realistic",
        AGGRESSIVE: "Aggressive",
        AUTO: "Auto",
      };
      data.personality_mode = map[data.mode];
    }

    if (typeof data.exposureCapPct === "number") {
      data.coinExposureLimit = data.exposureCapPct;
      if (data.exposureCapPct < 0 || data.exposureCapPct > 100) {
        logger.warn(
          `[SETTINGS-REJECTED] user=${operator} field=exposureCapPct value=${data.exposureCapPct}`
        );
        reply.code(400);
        return { error: "Invalid setting: exposureCapPct" };
      }
    }

    if (typeof data.maxLossPct === "number") {
      if (data.maxLossPct < 0 || data.maxLossPct > 100) {
        logger.warn(
          `[SETTINGS-REJECTED] user=${operator} field=maxLossPct value=${data.maxLossPct}`
        );
        reply.code(400);
        return { error: "Invalid setting: maxLossPct" };
      }
    }

    if (typeof data.latencyMaxMs === "number") {
      if (data.latencyMaxMs < 50 || data.latencyMaxMs > 5000) {
        logger.warn(
          `[SETTINGS-REJECTED] user=${operator} field=latencyMaxMs value=${data.latencyMaxMs}`
        );
        reply.code(400);
        return { error: "Invalid setting: latencyMaxMs" };
      }
    }

    if (typeof data.coinExposureLimit === "number") {
      if (data.coinExposureLimit < 0 || data.coinExposureLimit > 100) {
        logger.warn(
          `[SETTINGS-REJECTED] user=${operator} field=coinExposureLimit value=${data.coinExposureLimit}`
        );
        reply.code(400);
        return { error: "Invalid setting: coinExposureLimit" };
      }
    }

    if (typeof data.personality_mode === "string") {
      const modes = ["Realistic", "Aggressive", "Auto"];
      if (!modes.includes(data.personality_mode)) {
        logger.warn(
          `[SETTINGS-REJECTED] user=${operator} field=personality_mode value=${data.personality_mode}`
        );
        reply.code(400);
        return { error: "Invalid setting: personality_mode" };
      }
    }

    if (typeof data.sweep_cadence === "string") {
      const allowed = ["Daily", "Monthly", "None"];
      if (!allowed.includes(data.sweep_cadence)) {
        logger.warn(
          `[SETTINGS-REJECTED] sweep_cadence=${data.sweep_cadence} invalid mode=${mode} operator=${operator}`
        );
        reply.code(400);
        return { error: "invalid sweep_cadence" };
      }
    }

    req.body = data;
  };

  const saveSettings = async (req) => {
    const operator = req.user?.email || req.user?.id || req.ip;
    const mode = getExecutionMode(req);
    logger.audit(
      JSON.stringify({
        event: 'settings_update_request',
        operator,
        mode,
        changes: req.body,
        ts: new Date().toISOString(),
      })
    );
    if (typeof req.body.schema_version === "number") {
      settings.schema_version = req.body.schema_version;
    }
    if (typeof req.body.canary_mode === "boolean") {
      settings.canary_mode = req.body.canary_mode;
    }
    if (typeof req.body.useEnsemble === "boolean") {
      settings.useEnsemble = req.body.useEnsemble;
    }
    if (typeof req.body.shadowOnly === "boolean") {
      settings.shadowOnly = req.body.shadowOnly;
    }
    if (typeof req.body.ghost_mode === "boolean") {
      settings.ghost_mode = req.body.ghost_mode;
    }
    if (typeof req.body.sandbox_mode === "boolean") {
      if (
        process.env.SANDBOX_MODE === "true" &&
        req.body.sandbox_mode === false
      ) {
        // Ignore attempts to disable sandbox mode when forced by env
      } else {
        settings.sandbox_mode = req.body.sandbox_mode;
      }
    }
    if (typeof req.body.mode === "string") {
      const map = {
        REALISTIC: "Realistic",
        AGGRESSIVE: "Aggressive",
        AUTO: "Auto",
      };
      req.body.personality_mode = map[req.body.mode];
    }
    if (typeof req.body.personality_mode === "string") {
      if (req.body.personality_mode !== settings.personality_mode) {
        settings.personality_mode = req.body.personality_mode;
        setRiskFilterMode(req.body.personality_mode);
        try {
          await redis.publish(getControlChannel(), `mode:${req.body.personality_mode}`);
        } catch (err) {
          logger.error('Failed to publish mode update', err);
        }
      }
    }
    if (typeof req.body.sweep_cadence === "string") {
      const allowed = ["Daily", "Monthly", "None"];
      if (allowed.includes(req.body.sweep_cadence)) {
        settings.sweep_cadence = req.body.sweep_cadence;
      }
    }
    if (typeof req.body.maxLoss === "number") {
      settings.maxLoss = req.body.maxLoss;
    }
    if (typeof req.body.maxLossPct === "number") {
      settings.maxLossPct = req.body.maxLossPct;
      try {
        await redis.publish(getControlChannel(), `lossCap:${req.body.maxLossPct}`);
      } catch (err) {
        logger.error('Failed to publish lossCap update', err);
      }
    }
    if (typeof req.body.latencyMaxMs === "number") {
      settings.latencyMaxMs = req.body.latencyMaxMs;
      try {
        await redis.publish(getControlChannel(), `latency:${req.body.latencyMaxMs}`);
      } catch (err) {
        logger.error('Failed to publish latency update', err);
      }
    }
    if (typeof req.body.exposureCapPct === "number") {
      settings.coinExposureLimit = req.body.exposureCapPct;
    } else if (typeof req.body.coinExposureLimit === "number") {
      settings.coinExposureLimit = req.body.coinExposureLimit;
    }

    const now = new Date().toISOString();
    try {
      await Promise.all([
        redis.set('config:maxLossPct', JSON.stringify({ value: settings.maxLossPct, updatedAt: now })),
        redis.set('config:latencyMaxMs', JSON.stringify({ value: settings.latencyMaxMs, updatedAt: now })),
        redis.set('config:coinExposureLimit', JSON.stringify({ value: settings.coinExposureLimit, updatedAt: now })),
      ]);
    } catch (err) {
      logger.error('Failed to persist settings to Redis', err);
    }

    await loadSettingsFromRedis(redis);
    logger.audit(
      JSON.stringify({
        event: 'settings_updated',
        operator,
        mode,
        ts: new Date().toISOString(),
      })
    );
    return { saved: true };
  };

  app.route({
    method: ["POST", "PATCH"],
    url: "/settings",
    preHandler: validateSettings,
    handler: saveSettings,
  });
}
