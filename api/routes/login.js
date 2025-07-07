import bcrypt from 'bcryptjs';
import { findByEmail } from './userStore.js';

const SANDBOX_EMAIL = 'demo@prismarbitrage.ai';
const SANDBOX_PASS = 'demo1234';
const HARD_CODED_JWT = 'demo-token';

export default async function loginRoutes(app) {
  const sandboxMode = process.env.SANDBOX_MODE === 'true';

  app.post('/login', async (req, reply) => {
    const { email, password } = req.body;

    if (sandboxMode && email === SANDBOX_EMAIL && password === SANDBOX_PASS) {
      reply.setCookie('token', HARD_CODED_JWT, { httpOnly: true });
      return { token: HARD_CODED_JWT };
    }

    const user = findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const token = app.jwt.sign({ email, isAdmin: user.isAdmin }, { algorithm: 'HS256' });
      reply.setCookie('token', token, { httpOnly: true });
      return { token };
    }

    reply.code(401).send({ error: 'invalid credentials' });
  });
}
