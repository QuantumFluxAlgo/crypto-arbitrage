import { listUsers, addUser, updatePassword, removeUser } from './userStore.js';
import { requireFields } from '../middleware/validate.js';

export default async function userRoutes(app) {
  app.addHook('preHandler', async (req, reply) => {
    if (!req.user || !req.user.isAdmin) {
      reply.code(403).send({ error: 'forbidden' });
    }
  });

  app.get('/', async () => listUsers());

  app.post('/', { preHandler: requireFields(['email', 'password']) }, async (req) => {
    const { email, password, isAdmin } = req.body;
    const user = await addUser(email, password, !!isAdmin);
    return user;
  });

  app.put('/:id', { preHandler: requireFields(['password']) }, async (req, reply) => {
    const { id } = req.params;
    const { password } = req.body;
    const updated = await updatePassword(id, password);
    if (!updated) {
      reply.code(404);
      return { error: 'not found' };
    }
    return { updated: true };
  });

  app.delete('/:id', async (req, reply) => {
    const { id } = req.params;
    const removed = removeUser(id);
    if (!removed) {
      reply.code(404);
      return { error: 'not found' };
    }
    return { removed: true };
  });
}
