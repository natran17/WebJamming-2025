const request = require('supertest');
const app = require('../server');

describe('Workouts CRUD', () => {
  let token;
  beforeAll(async () => {
    const email = 'w@test.com';
    const password = 'Password123!';
    const reg = await request(app).post('/api/auth/register').send({ name: 'WT', email, password });
    if (reg.status !== 201) {
      throw new Error('Register failed: ' + reg.status + ' ' + JSON.stringify(reg.body));
    }
    token = reg.body.accessToken;
    if (!token) {
      const login = await request(app).post('/api/auth/login').send({ email, password });
      expect(login.status).toBe(200);
      token = login.body.accessToken;
      if (!token) {
        throw new Error('Login did not return accessToken: ' + JSON.stringify(login.body));
      }
    }
  });

  let createdId;
  it('creates a workout', async () => {
    const res = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title:'Week 1', weekOf: new Date().toISOString(), days: [{ day: 'monday', exercises: [{ name: 'Jogging', timeMinutes: 20 }] }] });
    expect(res.status).toBe(201);
    createdId = res.body._id;
  });
  it('lists workouts', async () => {
    const res = await request(app).get('/api/workouts').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('updates a workout', async () => {
    const res = await request(app).put(`/api/workouts/${createdId}`).set('Authorization', `Bearer ${token}`).send({ title: 'Week 1 Updated' });
    expect(res.status).toBe(200);
    expect(res.body.title).toContain('Updated');
  });
  it('deletes a workout', async () => {
    const res = await request(app).delete(`/api/workouts/${createdId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
