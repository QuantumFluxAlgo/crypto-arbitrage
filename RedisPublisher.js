import createLogger from './lib/logger.js';

const logger = createLogger('redis-publisher');

export async function setResumeConfirmation(redis) {
  try {
    await redis.set('resume_confirmed', 'true', 'EX', 60);
  } catch (err) {
    logger.error('Failed to set resume confirmation key', err);
  }
}
