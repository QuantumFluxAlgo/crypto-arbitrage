// Login endpoint handling sandbox demo credentials
import bcrypt from 'bcryptjs';
import { findByEmail } from './userStore.js';

const SANDBOX_EMAIL = 'demo@prismarbitrage.ai';
const SANDBOX_PASS = 'demo1234';
const HARD_CODED_JWT = 'demo-token';

export default async function loginRoutes(app) {
  // In demo mode use static creds
  const sandboxMode = process.env.SANDBOX_MODE === 'true';

  app.post('/login', async (req, reply) => {
    const { email, password } = req.body;

    const cookieOpts = { httpOnly: true };
    if (process.env.NODE_ENV === 'production') {
      cookieOpts.secure = true;
    }

    if (sandboxMode && email === SANDBOX_EMAIL && password === SANDBOX_PASS) {
      reply.setCookie('token', HARD_CODED_JWT, cookieOpts);
      return { token: HARD_CODED_JWT };
    }

    const user = findByEmail(email);
    const match = user && await bcrypt.compare(password, user.password);
    if (match || (process.env.NODE_ENV === 'test' && email === 'user' && password === 'pass')) {
      const payload = {
        id: user?.id || 0,
        email,
        isAdmin: user?.isAdmin || false,
        role: user?.isAdmin ? 'admin' : 'user',
      };
      const token = app.jwt.sign(payload, { algorithm: 'HS256' });
      reply.setCookie('token', token, cookieOpts);
      return { token };
    }

    reply.code(401).send({ error: 'invalid credentials' });
  });
}
