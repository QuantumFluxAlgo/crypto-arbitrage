import bcrypt from 'bcryptjs';

const hash = str => bcrypt.hashSync(str, 10);

const users = {
  user: hash('pass')
};

export default async function authRoutes(app) {
  app.post('/login', async (req, reply) => {
    const { email, password } = req.body;
    const stored = users[email];
    if (stored && await bcrypt.compare(password, stored)) {
      const token = app.jwt.sign({ email }, { algorithm: 'HS256' });
      reply.setCookie('token', token, { httpOnly: true });
      return { token };
    }
    reply.code(401).send({ error: 'invalid credentials' });
  });

  app.post('/change-password', async (req, reply) => {
    const { oldPassword, newPassword } = req.body;
    try {
      const { email } = await app.jwt.verify(req.cookies.token);
      const stored = users[email];
      if (!stored || !(await bcrypt.compare(oldPassword, stored))) {
        return reply.code(400).send({ error: 'invalid credentials' });
      }
      users[email] = await bcrypt.hash(newPassword, 10);
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
    users[email] = await bcrypt.hash(newPassword, 10);
    return { reset: true };
  });
}
