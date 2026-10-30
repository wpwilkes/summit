import app from '../../src/app.js';
import { registerVerifiedUser } from './helpers/register-verified-user.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

function _uniqueName() {
  return `test_${randomUUID().slice(0, 8)}`;
}

async function _registerUser() {
  return registerVerifiedUser('test');
}

async function _createCommunity(token: string, name = _uniqueName()) {
  const response = await request(app)
    .post('/api/communities')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name,
      description: 'Test community',
    });
  assert.equal(response.status, 201);
  return response.body.community;
}

test('POST /api/communities creates a community', async () => {
  const user = await _registerUser();
  const name = _uniqueName();
  const response = await request(app)
    .post('/api/communities')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      name,
      description: 'A community for testing',
    });
  assert.equal(response.status, 201);
  assert.equal(response.body.community.name, name);
  assert.equal(response.body.community.description, 'A community for testing');
  assert.equal(response.body.community.creatorId, user.id);
  assert.equal(typeof response.body.community.id, 'number');
});

test('POST /api/communities requires authentication', async () => {
  const response = await request(app).post('/api/communities').send({
    name: _uniqueName(),
    description: 'Unauthorized',
  });
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/communities rejects duplicate names', async () => {
  const user = await _registerUser();
  const name = _uniqueName();
  await _createCommunity(user.token, name);
  const response = await request(app)
    .post('/api/communities')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      name,
      description: 'Duplicate',
    });
  assert.equal(response.status, 409);
  assert.equal(response.body.error.code, 'COMMUNITY_ALREADY_EXISTS');
});

test('GET /api/communities returns communities', async () => {
  const user = await _registerUser();
  const community = await _createCommunity(user.token);
  const response = await request(app).get('/api/communities');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.communities));
  assert.ok(
    response.body.communities.some(
      (c: { id: number }) => c.id === community.id,
    ),
  );
});

test('GET /api/communities/:name returns a community', async () => {
  const user = await _registerUser();
  const community = await _createCommunity(user.token);
  const response = await request(app).get(`/api/communities/${community.name}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.community.id, community.id);
});

test('GET returns 404 for a missing community', async () => {
  const response = await request(app).get(`/api/communities/${_uniqueName()}`);
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'COMMUNITY_NOT_FOUND');
});

test('PATCH allows the creator to edit a community', async () => {
  const user = await _registerUser();
  const community = await _createCommunity(user.token);
  const response = await request(app)
    .patch(`/api/communities/${community.name}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ description: 'Updated description' });
  assert.equal(response.status, 200);
  assert.equal(response.body.community.description, 'Updated description');
  const check = await request(app).get(`/api/communities/${community.name}`);
  assert.equal(check.body.community.description, 'Updated description');
});

test('PATCH rejects updates from another user', async () => {
  const creator = await _registerUser();
  const other = await _registerUser();
  const community = await _createCommunity(creator.token);
  const response = await request(app)
    .patch(`/api/communities/${community.name}`)
    .set('Authorization', `Bearer ${other.token}`)
    .send({ description: 'Unauthorized change' });
  assert.equal(response.status, 403);
  assert.equal(response.body.error.code, 'FORBIDDEN');
  const check = await request(app).get(`/api/communities/${community.name}`);
  assert.equal(check.body.community.description, 'Test community');
});

test('POST /api/posts requires a communityId', async () => {
  const user = await _registerUser();
  const response = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      title: 'Missing community',
      body: 'This should fail',
    });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_REQUEST');
});

test('POST /api/posts rejects nonexistent communities', async () => {
  const user = await _registerUser();
  const response = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      communityId: 2147483647,
      title: 'Invalid community',
      body: 'This should fail',
    });
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'COMMUNITY_NOT_FOUND');
});

test('GET community posts returns only its posts', async () => {
  const user = await _registerUser();
  const first = await _createCommunity(user.token);
  const second = await _createCommunity(user.token);
  const firstPost = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      communityId: first.id,
      title: 'Post in first community',
      body: 'First',
    });
  const secondPost = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      communityId: second.id,
      title: 'Post in second community',
      body: 'Second',
    });
  assert.equal(firstPost.status, 201);
  assert.equal(secondPost.status, 201);
  assert.equal(firstPost.body.post.communityId, first.id);
  const response = await request(app).get(
    `/api/communities/${first.name}/posts`,
  );
  assert.equal(response.status, 200);
  const posts = response.body.posts as Array<{
    id: number;
    communityId: number;
  }>;
  assert.ok(posts.some((p) => p.id === firstPost.body.post.id));
  assert.ok(!posts.some((p) => p.id === secondPost.body.post.id));
  assert.ok(posts.every((p) => p.communityId === first.id));
});

test('GET community posts returns an empty array when none exist', async () => {
  const user = await _registerUser();
  const community = await _createCommunity(user.token);
  const response = await request(app).get(
    `/api/communities/${community.name}/posts`,
  );
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.posts, []);
});
