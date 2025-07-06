import settings from '../config/settings.js';

export { settings };

export default async function settingsRoutes(app) {
  app.get('/settings', async () => settings);

  app.post('/settings', async req => {
    if (typeof req.body.canary_mode === 'boolean') {
      settings.canary_mode = req.body.canary_mode;
    }
    if (typeof req.body.sandbox_mode === 'boolean' && !process.env.SANDBOX_MODE) {
      settings.sandbox_mode = req.body.sandbox_mode;
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
    return { saved: true };
  });
}
