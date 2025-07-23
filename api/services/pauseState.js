import logger from './logger.js';

export const PAUSE_KEY = 'arb:paused_state';
export const RESUME_FAILED_KEY = 'arb:resume_failed';

export async function setPauseState(redis, value) {
  try {
    await redis.set(PAUSE_KEY, value ? 'true' : 'false');
  } catch (err) {
    logger.warn('[REDIS ERROR] Cannot access paused state — defaulting to safe paused mode');
  }
}

export async function getPauseState(redis) {
  try {
    const val = await redis.get(PAUSE_KEY);
    return val === 'true';
  } catch (err) {
    logger.warn('[REDIS ERROR] Cannot access paused state — defaulting to safe paused mode');
    return true;
  }
}

export async function getResumeFailed(redis) {
  try {
    const val = await redis.get(RESUME_FAILED_KEY);
    return val === 'true';
  } catch (err) {
    logger.warn('[REDIS ERROR] Cannot access resume_failed flag');
    return false;
  }
}

export async function setResumeFailed(redis, value) {
  try {
    await redis.set(RESUME_FAILED_KEY, value ? 'true' : 'false');
  } catch (err) {
    logger.warn('[REDIS ERROR] Cannot update resume_failed flag');
  }
}
