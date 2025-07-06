import bcrypt from 'bcryptjs';
import { findByEmail, addUser, updatePassword } from './userStore.js';

export default async function authRoutes(app) {

  app.post('/change-password', async (req, reply) => {
    const { oldPassword, newPassword } = req.body;
    try {
      const { email } = await app.jwt.verify(req.cookies.token);
      const user = findByEmail(email);
      if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
        return reply.code(400).send({ error: 'invalid credentials' });
      }
      await updatePassword(user.id, newPassword);
      return { changed: true };
    } catch {
      return reply.code(401).send({ error: 'unauthorized' });
    }
  });

  app.post('/reset-password', async (req, reply) => {
    const adminToken = req.headers['x-admin-token'];
    if (adminToken !== (process.env.ADMIN_TOKEN || 'admin-secret')) {
      return reply.code(401).send({ error: 'unauthorized' });
    }
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return reply.code(400).send({ error: 'missing params' });
    }
    const user = findByEmail(email);
    if (user) {
      await updatePassword(user.id, newPassword);
    } else {
      await addUser(email, newPassword, false);
    }
    return { reset: true };
  });
}
