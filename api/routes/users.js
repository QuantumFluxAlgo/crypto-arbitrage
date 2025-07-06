import { listUsers, addUser, updatePassword, removeUser } from './userStore.js';

export default async function userRoutes(app) {
  app.addHook('preHandler', async (req, reply) => {
    if (!req.user || !req.user.isAdmin) {
      reply.code(403).send({ error: 'forbidden' });
    }
  });

  app.get('/', async () => listUsers());

  app.post('/', async (req, reply) => {
    const { email, password, isAdmin } = req.body;
    if (!email || !password) {
      reply.code(400);
      return { error: 'email and password required' };
    }
    const user = await addUser(email, password, !!isAdmin);
    return user;
  });

  app.put('/:id', async (req, reply) => {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) {
      reply.code(400);
      return { error: 'password required' };
    }
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
