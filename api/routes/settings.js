export let settings = {
  canary_mode: false,
  useEnsemble: true,
  shadowOnly: false
};

export default async function settingsRoutes(app) {
  app.get('/settings', async () => settings);

  app.post('/settings', async req => {
    if (typeof req.body.canary_mode === 'boolean') {
      settings.canary_mode = req.body.canary_mode;
    }
    if (typeof req.body.useEnsemble === 'boolean') {
      settings.useEnsemble = req.body.useEnsemble;
    }
    if (typeof req.body.shadowOnly === 'boolean') {
      settings.shadowOnly = req.body.shadowOnly;
    }
    return { saved: true };
  });
}

