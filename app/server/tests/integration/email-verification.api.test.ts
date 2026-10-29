import app from '../../src/app';
import { getTestVerificationCode } from '../../src/auth/verification/verification.console.js';
import { prismaClient } from '../../src/lib/prisma.js';
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

test('Verification codes are single-use', async () => {
  const user = await _registerUser();
  const code = getTestVerificationCode(user.email);
  assert.ok(code);
  const first = await request(app)
    .post('/api/auth/verify-email')
    .send({ email: user.email, code });
  const second = await request(app)
    .post('/api/auth/verify-email')
    .send({ email: user.email, code });
  assert.equal(first.status, 200);
  assert.equal(second.status, 400);
  assert.equal(second.body.error.code, 'INVALID_VERIFICATION_CODE');
});

test('Incorrect verification codes are rejected', async () => {
  const user = await _registerUser();
  const code = getTestVerificationCode(user.email);
  assert.ok(code);
  const wrongCode = code === '000000' ? '000001' : '000000';
  const response = await request(app)
    .post('/api/auth/verify-email')
    .send({ email: user.email, code: wrongCode });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_VERIFICATION_CODE');
});

test('Expired verification codes are rejected', async () => {
  const user = await _registerUser();
  const code = getTestVerificationCode(user.email);
  assert.ok(code);
  const account = await prismaClient.user.findUnique({
    where: { email: user.email },
  });
  assert.ok(account);
  await prismaClient.emailVerification.update({
    where: { userId: account.id },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  const response = await request(app)
    .post('/api/auth/verify-email')
    .send({ email: user.email, code });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_VERIFICATION_CODE');
});

test('Resend generates a usable verification code', async () => {
  const user = await _registerUser();
  const account = await prismaClient.user.findUnique({
    where: { email: user.email },
  });
  assert.ok(account);
  await prismaClient.emailVerification.update({
    where: { userId: account.id },
    data: { sentAt: new Date(Date.now() - 61_000) },
  });
  const response = await request(app)
    .post('/api/auth/resend-verification')
    .send({ email: user.email });
  assert.equal(response.status, 200);
  const code = getTestVerificationCode(user.email);
  assert.ok(code);
  const verification = await request(app)
    .post('/api/auth/verify-email')
    .send({ email: user.email, code });
  assert.equal(verification.status, 200);
});
