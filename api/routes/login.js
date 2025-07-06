import bcrypt from 'bcryptjs';
import { findByEmail } from './userStore.js';

export default async function loginRoutes(app) {
  app.post('/login', async (req, reply) => {
    const { email, password } = req.body;
    const user = findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const token = app.jwt.sign({ email, isAdmin: user.isAdmin }, { algorithm: 'HS256' });
      reply.setCookie('token', token, { httpOnly: true });
      return { token };
    }
    reply.code(401).send({ error: 'invalid credentials' });
  });
}
