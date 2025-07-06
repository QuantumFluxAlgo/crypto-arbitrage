export let settings = {
  canary_mode: false
};

export default async function settingsRoutes(app) {
  app.get('/settings', async () => settings);

  app.post('/settings', async req => {
    if (typeof req.body.canary_mode === 'boolean') {
      settings.canary_mode = req.body.canary_mode;
    }
    return { saved: true };
  });
}
