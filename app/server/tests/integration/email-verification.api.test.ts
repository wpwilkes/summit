import app from '../../src/app';
import { getTestVerificationCode } from '../../src/auth/verification/verification.console.js';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import request from 'supertest';

function _credentials() {
  const suffix = randomUUID().slice(0, 8);
  return {
    email: `verify-${suffix}@example.com`,
    username: `verify${suffix}`,
    password: 'securepass123',
  };
}

async function _registerUser() {
  const user = _credentials();
  const response = await request(app).post('/api/auth/register').send(user);
  assert.equal(response.status, 201);
  return user;
}

test('Registration does not issue a JWT', async () => {
  const user = _credentials();
  const response = await request(app).post('/api/auth/register').send(user);
  assert.equal(response.status, 201);
  assert.equal(response.body.token, undefined);
  assert.equal(typeof response.body.message, 'string');
});

test('Login rejects unverified users', async () => {
  const user = await _registerUser();
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });
  assert.equal(response.status, 403);
  assert.equal(response.body.error.code, 'EMAIL_NOT_VERIFIED');
});

test('Correct verification code enables login', async () => {
  const user = await _registerUser();
  const code = getTestVerificationCode(user.email);
  assert.ok(code);
  const verification = await request(app)
    .post('/api/auth/verify-email')
    .send({ email: user.email, code });
  assert.equal(verification.status, 200);
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });
  assert.equal(login.status, 200);
  assert.equal(typeof login.body.token, 'string');
});
