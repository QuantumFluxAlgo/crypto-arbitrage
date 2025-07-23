import logger from './logger.js';

export const PAUSE_KEY = 'arb:paused_state';
export const RESUME_FAILED_KEY = 'resume_failed';
export const RESUME_ACK_KEY = 'resume_ack';

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

export async function setResumeAck(redis) {
  try {
    await redis.set(RESUME_ACK_KEY, 'true', 'EX', 60);
  } catch (err) {
    logger.warn('[REDIS ERROR] Cannot set resume ack');
  }
}
