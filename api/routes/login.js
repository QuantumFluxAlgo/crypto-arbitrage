import bcrypt from 'bcryptjs';

const hash = (str) => bcrypt.hashSync(str, 10);

const users = {
    user: hash('pass')
};

export default async function loginRoutes(app) {
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
}
