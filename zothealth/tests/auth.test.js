const request = require('supertest');
const app = require('../server');

describe('Auth', () => {
  const email = 'user@test.com';
  const password = 'Password123!';
  let accessToken;
  it('registers a user', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'User', email, password });
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    accessToken = res.body.accessToken;
  });
  it('logs in user', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });
  it('gets profile with token', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
  });
});
