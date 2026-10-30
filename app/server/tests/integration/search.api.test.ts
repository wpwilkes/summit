import app from '../../src/app';
import { registerVerifiedUser } from './helpers/register-verified-user.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

// Sign up a brand new, email-verified user so every test run is independent.
async function _registerUser() {
  return registerVerifiedUser('searchtest');
}

// Posts must belong to a community, so make a fresh one for each post.
async function _createCommunity(token: string): Promise<number> {
  const name = `search_${randomUUID().slice(0, 8)}`;
  const response = await request(app)
    .post('/api/communities')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, description: 'Search test community' });
  assert.equal(response.status, 201);
  return response.body.community.id as number;
}

async function _createPost(token: string, title: string, body: string) {
  const communityId = await _createCommunity(token);
  const response = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({ communityId, title, body });
  assert.equal(response.status, 201);
  return response.body.post;
}

function _assertApiError(
  response: {
    status: number;
    body: { error?: { code?: string; message?: string } };
  },
  status: number,
  code: string,
): void {
  assert.equal(response.status, status);
  assert.equal(response.body.error?.code, code);
  assert.equal(typeof response.body.error?.message, 'string');
}

test('GET /api/search/posts finds posts by title keyword', async () => {
  const user = await _registerUser();
  const keyword = `zebra${randomUUID().slice(0, 8)}`;
  const post = await _createPost(user.token, `About ${keyword}`, 'Some body.');
  await _createPost(user.token, 'Unrelated post', 'Nothing to see here.');

  const response = await request(app)
    .get('/api/search/posts')
    .query({ q: keyword });

  assert.equal(response.status, 200);
  assert.equal(response.body.query, keyword);
  assert.equal(response.body.posts.length, 1);
  assert.equal(response.body.posts[0].id, post.id);
  assert.equal(response.body.posts[0].title, `About ${keyword}`);
  assert.equal(response.body.posts[0].authorUsername, user.username);
  assert.equal(response.body.posts[0].votes, 0);
  assert.equal(response.body.posts[0].commentCount, 0);
});

test('GET /api/search/posts finds posts by body keyword, ignoring case', async () => {
  const user = await _registerUser();
  const keyword = `giraffe${randomUUID().slice(0, 8)}`;
  const post = await _createPost(
    user.token,
    'Plain title',
    `The body mentions ${keyword}.`,
  );

  const response = await request(app)
    .get('/api/search/posts')
    .query({ q: keyword.toUpperCase() });

  assert.equal(response.status, 200);
  assert.equal(response.body.posts.length, 1);
  assert.equal(response.body.posts[0].id, post.id);
});

test('GET /api/search/posts counts comments on each result', async () => {
  const user = await _registerUser();
  const keyword = `walrus${randomUUID().slice(0, 8)}`;
  const post = await _createPost(user.token, keyword, 'Body text.');
  await request(app)
    .post(`/api/posts/${post.id}/comments`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ body: 'First comment' });

  const response = await request(app)
    .get('/api/search/posts')
    .query({ q: keyword });

  assert.equal(response.status, 200);
  assert.equal(response.body.posts[0].commentCount, 1);
});

test('GET /api/search/posts returns an empty list when nothing matches', async () => {
  const response = await request(app)
    .get('/api/search/posts')
    .query({ q: `nomatch${randomUUID()}` });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.posts, []);
});

test('GET /api/search/posts rejects a missing keyword', async () => {
  const response = await request(app).get('/api/search/posts');
  _assertApiError(response, 400, 'INVALID_REQUEST');
});

test('GET /api/search/posts rejects a blank keyword', async () => {
  const response = await request(app)
    .get('/api/search/posts')
    .query({ q: '   ' });
  _assertApiError(response, 400, 'INVALID_REQUEST');
});

test('GET /api/search/posts rejects a keyword over 100 characters', async () => {
  const response = await request(app)
    .get('/api/search/posts')
    .query({ q: 'a'.repeat(101) });
  _assertApiError(response, 400, 'INVALID_REQUEST');
});
