export let settings = {
  canary_mode: false,
  useEnsemble: true,
  shadowOnly: false,
  ghost_mode: false,
  sandbox_mode: process.env.SANDBOX_MODE === 'true',
  personality_mode: 'Realistic'
};

export default async function settingsRoutes(app) {
  app.get('/settings', async () => settings);

  const bodySchema = {
    type: 'object',
    properties: {
      canary_mode: { type: 'boolean' },
      useEnsemble: { type: 'boolean' },
      shadowOnly: { type: 'boolean' },
      ghost_mode: { type: 'boolean' },
      sandbox_mode: { type: 'boolean' },
      personality_mode: { type: 'string' }
    },
    additionalProperties: false
  };

  const saveSettings = async req => {
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
    return { saved: true };
  };

  app.route({
    method: ['POST', 'PATCH'],
    url: '/settings',
    schema: { body: bodySchema },
    handler: saveSettings
  });
}

