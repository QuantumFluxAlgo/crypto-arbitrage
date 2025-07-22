export function requireFields(fields) {
  return async function(req, reply) {
    for (const field of fields) {
      if (!req.body || req.body[field] === undefined || req.body[field] === '') {
        reply.code(400);
        reply.send({ error: `${field} required` });
        return;
      }
    }
  };
}

export function ensurePaused(testState) {
  return async function(_req, reply) {
    if (testState && !testState.paused) {
      reply.code(400);
      reply.send({ error: 'not paused' });
      return;
    }
    if (testState) {
      testState.paused = false;
      testState.panicReason = null;
    }
  };
}
