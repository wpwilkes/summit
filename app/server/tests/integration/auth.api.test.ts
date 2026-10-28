import app from '../../src/app';
import { getTestVerificationCode } from '../../src/auth/verification/verification.console.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';

test('POST /api/auth/login logs in an existing user', async () => {
  const suffix = Date.now();
  const user = {
    email: `logintest-${suffix}@example.com`,
    username: `logintest${suffix}`,
    password: 'securepass123',
  };
  await request(app).post('/api/auth/register').send(user);
  const code = getTestVerificationCode(user.email);
  assert.ok(code);
  const verification = await request(app)
    .post('/api/auth/verify-email')
    .send({ email: user.email, code });
  assert.equal(verification.status, 200);

  const response = await request(app).post('/api/auth/login').send({
    email: user.email,
    password: user.password,
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.user.email, user.email);
  assert.equal(response.body.user.username, user.username);
  assert.equal(typeof response.body.token, 'string');
});

test('POST /api/auth/login returns 401 for invalid credentials', async () => {
  const suffix = Date.now();
  const user = {
    email: `invalidtest-${suffix}@example.com`,
    username: `invalidtest${suffix}`,
    password: 'securepass123',
  };
  await request(app).post('/api/auth/register').send(user);

  const response = await request(app).post('/api/auth/login').send({
    email: user.email,
    password: 'wrongpassword',
  });

  assert.equal(response.status, 401);
});

test('GET /api/auth/me returns the authenticated user', async () => {
  const suffix = Date.now();
  const user = {
    email: `metest-${suffix}@example.com`,
    username: `metest${suffix}`,
    password: 'securepass123',
  };
  await request(app).post('/api/auth/register').send(user);
  const code = getTestVerificationCode(user.email);
  assert.ok(code);
  const verification = await request(app)
    .post('/api/auth/verify-email')
    .send({ email: user.email, code });
  assert.equal(verification.status, 200);

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });
  assert.equal(loginResponse.status, 200);

  const response = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${loginResponse.body.token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.user.email, user.email);
  assert.equal(response.body.user.username, user.username);
});

test('GET /api/auth/me returns 401 without a token', async () => {
  const response = await request(app).get('/api/auth/me');
  assert.equal(response.status, 401);
});

test('POST /api/auth/register creates a new unverified user', async () => {
  const suffix = Date.now();
  const user = {
    email: `registertest-${suffix}@example.com`,
    username: `registertest${suffix}`,
    password: 'securepass123',
  };

  const response = await request(app).post('/api/auth/register').send(user);

  assert.equal(response.status, 201);
  assert.equal(typeof response.body.message, 'string');
  assert.equal(response.body.token, undefined);
});
