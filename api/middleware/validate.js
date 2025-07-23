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

import { getPauseState, setPauseState } from '../services/pauseState.js';

export function ensurePaused(redis) {
  return async function (_req, reply) {
    const paused = await getPauseState(redis);
    if (!paused) {
      reply.code(400);
      reply.send({ error: 'not paused' });
      return;
    }
    await setPauseState(redis, false);
  };
}
