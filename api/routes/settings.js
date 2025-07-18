import { z } from 'zod';

export let settings = {
  schema_version: 1,
  canary_mode: false,
  useEnsemble: true,
  shadowOnly: false,
  ghost_mode: false,
  sandbox_mode: process.env.SANDBOX_MODE === 'true',
  personality_mode: 'Realistic',
  sweep_cadence: 'None',
  maxLoss: 0
};

export default async function settingsRoutes(app) {
  app.get('/settings', async () => settings);

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
    })
    .strict();

  const validateSettings = async (req, reply) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      reply.code(400);
      return { error: 'invalid settings' };
    }
    req.body = result.data;
  };

  const saveSettings = async req => {
    if (typeof req.body.schema_version === 'number') {
      settings.schema_version = req.body.schema_version;
    }
    if (typeof req.body.canary_mode === 'boolean') {
      settings.canary_mode = req.body.canary_mode;
    }
    if (typeof req.body.useEnsemble === 'boolean') {
      settings.useEnsemble = req.body.useEnsemble;
    }
    if (typeof req.body.shadowOnly === 'boolean') {
      settings.shadowOnly = req.body.shadowOnly;
    }
    if (typeof req.body.ghost_mode === 'boolean') {
      settings.ghost_mode = req.body.ghost_mode;
    }
    if (typeof req.body.sandbox_mode === 'boolean') {
      if (
        process.env.SANDBOX_MODE === 'true' &&
        req.body.sandbox_mode === false
      ) {
        // Ignore attempts to disable sandbox mode when forced by env
      } else {
        settings.sandbox_mode = req.body.sandbox_mode;
      }
    }
    if (typeof req.body.personality_mode === 'string') {
      settings.personality_mode = req.body.personality_mode;
    }
    if (typeof req.body.sweep_cadence === 'string') {
      const allowed = ['Daily', 'Monthly', 'None'];
      if (allowed.includes(req.body.sweep_cadence)) {
        settings.sweep_cadence = req.body.sweep_cadence;
      }
    }
    if (typeof req.body.maxLoss === 'number') {
      settings.maxLoss = req.body.maxLoss;
    }
    return { saved: true };
  };

  app.route({
    method: ['POST', 'PATCH'],
    url: '/settings',
    preHandler: validateSettings,
    handler: saveSettings
  });
}
