import app from '../../../src/app';
import { getTestVerificationCode } from '../../../src/auth/verification/verification.console.js';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

export async function registerVerifiedUser(prefix = 'test') {
  const suffix = randomUUID().slice(0, 8);
  const email = `${prefix}-${suffix}@example.com`;
  const username = `${prefix}${suffix}`;
  const password = 'securepass123';
  const registration = await request(app)
    .post('/api/auth/register')
    .send({ email, username, password });
  assert.equal(registration.status, 201);
  const code = getTestVerificationCode(email);
  const verification = await request(app)
    .post('/api/auth/verify-email')
    .send({ email, code });
  assert.equal(verification.status, 200);
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  assert.equal(login.status, 200);
  return {
    id: login.body.user.id as number,
    token: login.body.token as string,
    email,
    username,
  };
}
