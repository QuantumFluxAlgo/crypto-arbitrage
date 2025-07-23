import request from 'supertest';
import { jest } from '@jest/globals';

const mockPool = { query: jest.fn(), end: jest.fn() };
jest.mock('pg', () => ({
  Pool: jest.fn(() => mockPool)
}));

const describeLocal =
  process.env.TEST_ENV === 'local' || !process.env.TEST_ENV
    ? describe
    : describe.skip;

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.SANDBOX_MODE = 'true';

let buildApp;
let app;
let cookie;

beforeAll(async () => {
  ({ buildApp } = await import('../../index.js'));
  app = buildApp();
  await app.listen({ port: 0 });

  const login = await request(app.server)
    .post('/api/login')
    .send({ email: 'user', password: 'pass' });
  cookie = login.headers['set-cookie'][0].split(';')[0];
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  mockPool.query.mockReset();
});

describeLocal('model routes', () => {
  test('GET /model/version returns metadata object', async () => {
    const mockRow = {
      version_hash: 'abc123',
      trained_at: '2024-01-01T00:00:00Z',
      sharpe: 2.0,
      win_rate: 0.5,
      val_loss: 0.1,
    };
    mockPool.query.mockResolvedValue({ rows: [mockRow] });

    const res = await request(app.server)
      .get('/api/model/version')
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('version_hash', mockRow.version_hash);
    expect(mockPool.query).toHaveBeenCalledTimes(1);
  });

  test('POST /models/event logs an event', async () => {
    mockPool.query.mockResolvedValue({});

    const payload = {
      version_hash: 'abc123',
      change_type: 'deploy',
      changed_by: 'tester',
    };

    const res = await request(app.server)
      .post('/api/models/event')
      .set('Cookie', cookie)
      .send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ logged: true });
    expect(mockPool.query).toHaveBeenCalledTimes(1);
  });
});
