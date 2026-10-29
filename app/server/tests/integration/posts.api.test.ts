import app from '../../src/app';
import { registerVerifiedUser } from './helpers/register-verified-user.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

async function _registerUser() {
  return registerVerifiedUser('posttest');
}

async function _createCommunity(token: string): Promise<number> {
  const name = `test_${randomUUID().slice(0, 8)}`;
  const response = await request(app)
    .post('/api/communities')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, description: 'Test community' });
  assert.equal(response.status, 201);
  return response.body.community.id as number;
}

async function _createPost(token: string) {
  const communityId = await _createCommunity(token);
  const response = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      communityId,
      title: 'Test post',
      body: 'This is a test post.',
    });
  return response.body.post;
}

function _assertApiError(
  response: {
    status: number;
    body: {
      error?: {
        code?: string;
        message?: string;
      };
    };
  },
  status: number,
  code: string,
): void {
  assert.equal(response.status, status);
  assert.equal(response.body.error?.code, code);
  assert.equal(typeof response.body.error?.message, 'string');
}

test('POST /api/posts creates a new post', async () => {
  const user = await _registerUser();
  const communityId = await _createCommunity(user.token);
  const response = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      communityId,
      title: 'My first post',
      body: 'Hello Summit!',
    });
  assert.equal(response.status, 201);
  assert.equal(response.body.post.title, 'My first post');
  assert.equal(response.body.post.body, 'Hello Summit!');
  assert.equal(response.body.post.authorId, user.id);
  assert.equal(response.body.post.votes, 0);
  assert.equal(typeof response.body.post.id, 'number');
  assert.equal(typeof response.body.post.createdAt, 'string');
});

test('POST /api/posts returns 401 without a token', async () => {
  const response = await request(app).post('/api/posts').send({
    title: 'Unauthorized post',
    body: 'This should fail.',
  });
  _assertApiError(response, 401, 'UNAUTHORIZED');
});

test('POST /api/posts returns 401 for an invalid token', async () => {
  const response = await request(app)
    .post('/api/posts')
    .set('Authorization', 'Bearer invalid-token')
    .send({
      title: 'Unauthorized post',
      body: 'This should fail.',
    });
  _assertApiError(response, 401, 'INVALID_TOKEN');
});

test('POST /api/posts returns 400 for invalid data', async () => {
  const user = await _registerUser();
  const communityId = await _createCommunity(user.token);
  const response = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      communityId,
      title: '',
      body: 'This post has no title.',
    });
  _assertApiError(response, 400, 'INVALID_REQUEST');
});

test('POST /api/posts uses the authenticated author', async () => {
  const user = await _registerUser();
  const communityId = await _createCommunity(user.token);
  const response = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      communityId,
      title: 'Author test',
      body: 'Testing author ownership.',
      authorId: 999999,
    });
  assert.equal(response.status, 201);
  assert.equal(response.body.post.authorId, user.id);
});

test('GET /api/posts returns a list of posts', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app).get('/api/posts');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.posts));
  assert.ok(response.body.posts.some((p: { id: number }) => p.id === post.id));
});

test('GET /api/posts returns posts newest first', async () => {
  const user = await _registerUser();
  const firstPost = await _createPost(user.token);
  const secondPost = await _createPost(user.token);
  const response = await request(app).get('/api/posts');
  assert.equal(response.status, 200);
  const ids = (response.body.posts as { id: number }[]).map((post) => post.id);
  const firstIndex = ids.indexOf(firstPost.id);
  const secondIndex = ids.indexOf(secondPost.id);
  assert.ok(firstIndex !== -1);
  assert.ok(secondIndex !== -1);
  assert.ok(secondIndex < firstIndex);
});

test('GET /api/posts/:postId returns an existing post', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app).get(`/api/posts/${post.id}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.post.id, post.id);
  assert.equal(response.body.post.title, post.title);
  assert.equal(response.body.post.body, post.body);
});

test('GET /api/posts/:postId returns 404 for a missing post', async () => {
  const response = await request(app).get('/api/posts/214789897');
  _assertApiError(response, 404, 'POST_NOT_FOUND');
});

test('GET /api/posts/:postId returns 400 for an invalid ID', async () => {
  const response = await request(app).get('/api/posts/invalidId');
  _assertApiError(response, 400, 'INVALID_ID');
});

test('PATCH /api/posts/:postId updates an existing post', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app)
    .patch(`/api/posts/${post.id}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      title: 'Updated title',
      body: 'Updated body.',
    });
  assert.equal(response.status, 200);
  assert.equal(response.body.post.id, post.id);
  assert.equal(response.body.post.title, 'Updated title');
  assert.equal(response.body.post.body, 'Updated body.');
  const getResponse = await request(app).get(`/api/posts/${post.id}`);
  assert.equal(getResponse.status, 200);
  assert.equal(getResponse.body.post.title, 'Updated title');
  assert.equal(getResponse.body.post.body, 'Updated body.');
});

test('PATCH /api/posts/:postId supports partial updates', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app)
    .patch(`/api/posts/${post.id}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      title: 'Updated title only',
    });
  assert.equal(response.status, 200);
  assert.equal(response.body.post.title, 'Updated title only');
  assert.equal(response.body.post.body, 'This is a test post.');
});

test('PATCH /api/posts/:postIid returns 401 without a token', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app).patch(`/api/posts/${post.id}`).send({
    title: 'Unauthorized update',
  });
  _assertApiError(response, 401, 'UNAUTHORIZED');
});

test('PATCH /api/posts/:postId returns 403 for another user', async () => {
  const author = await _registerUser();
  const otherUser = await _registerUser();
  const post = await _createPost(author.token);
  const response = await request(app)
    .patch(`/api/posts/${post.id}`)
    .set('Authorization', `Bearer ${otherUser.token}`)
    .send({
      title: 'Someone else edited this',
    });
  _assertApiError(response, 403, 'FORBIDDEN');
  const getResponse = await request(app).get(`/api/posts/${post.id}`);
  assert.equal(getResponse.status, 200);
  assert.equal(getResponse.body.post.title, 'Test post');
});

test('PATCH /api/posts/:postId returns 400 for empty update', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app)
    .patch(`/api/posts/${post.id}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({});
  _assertApiError(response, 400, 'INVALID_REQUEST');
});

test('PATCH /api/posts/:postId returns 404 for a missing post', async () => {
  const user = await _registerUser();
  const response = await request(app)
    .patch('/api/posts/214583647')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      title: 'Updated title',
    });

  _assertApiError(response, 404, 'POST_NOT_FOUND');
});

test('DELETE /api/posts/:postId deletes an existing post', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app)
    .delete(`/api/posts/${post.id}`)
    .set('Authorization', `Bearer ${user.token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  const getResponse = await request(app).get(`/api/posts/${post.id}`);
  _assertApiError(getResponse, 404, 'POST_NOT_FOUND');
});

test('DELETE /api/posts/:postId returns 401 without a token', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app).delete(`/api/posts/${post.id}`);
  _assertApiError(response, 401, 'UNAUTHORIZED');
});

test('DELETE /api/posts/:postId returns 403 for another user', async () => {
  const author = await _registerUser();
  const otherUser = await _registerUser();
  const post = await _createPost(author.token);
  const response = await request(app)
    .delete(`/api/posts/${post.id}`)
    .set('Authorization', `Bearer ${otherUser.token}`);
  _assertApiError(response, 403, 'FORBIDDEN');
  const getResponse = await request(app).get(`/api/posts/${post.id}`);
  assert.equal(getResponse.status, 200);
  assert.equal(getResponse.body.post.id, post.id);
});

test('DELETE /api/posts/:postId returns 404 for a missing post', async () => {
  const user = await _registerUser();
  const response = await request(app)
    .delete('/api/posts/2147483647')
    .set('Authorization', `Bearer ${user.token}`);
  _assertApiError(response, 404, 'POST_NOT_FOUND');
});

test('PUT /api/posts/:postId/vote upvotes a post', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app)
    .put(`/api/posts/${post.id}/vote`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ value: 1 });
  assert.equal(response.status, 200);
  assert.equal(response.body.votes, 1);
  assert.equal(response.body.userVote, 1);
});

test('PUT /api/posts/:postId/vote downvotes a post', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app)
    .put(`/api/posts/${post.id}/vote`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ value: -1 });
  assert.equal(response.status, 200);
  assert.equal(response.body.votes, -1);
  assert.equal(response.body.userVote, -1);
});

test('PUT voting twice does not duplicate the vote', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  for (let i = 0; i < 2; i++) {
    const response = await request(app)
      .put(`/api/posts/${post.id}/vote`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ value: 1 });
    assert.equal(response.status, 200);
    assert.equal(response.body.votes, 1);
  }
});

test('PUT switches an upvote to a downvote', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  await request(app)
    .put(`/api/posts/${post.id}/vote`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ value: 1 });
  const response = await request(app)
    .put(`/api/posts/${post.id}/vote`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ value: -1 });
  assert.equal(response.status, 200);
  assert.equal(response.body.votes, -1);
  assert.equal(response.body.userVote, -1);
});

test('PUT removes an existing vote', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  await request(app)
    .put(`/api/posts/${post.id}/vote`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ value: 1 });
  const response = await request(app)
    .put(`/api/posts/${post.id}/vote`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ value: 0 });
  assert.equal(response.status, 200);
  assert.equal(response.body.votes, 0);
  assert.equal(response.body.userVote, 0);
});

test('PUT aggregates votes from different users', async () => {
  const author = await _registerUser();
  const voter1 = await _registerUser();
  const voter2 = await _registerUser();
  const post = await _createPost(author.token);
  await request(app)
    .put(`/api/posts/${post.id}/vote`)
    .set('Authorization', `Bearer ${voter1.token}`)
    .send({ value: 1 });
  const response = await request(app)
    .put(`/api/posts/${post.id}/vote`)
    .set('Authorization', `Bearer ${voter2.token}`)
    .send({ value: -1 });
  assert.equal(response.status, 200);
  assert.equal(response.body.votes, 0);
  const getResponse = await request(app).get(`/api/posts/${post.id}`);
  assert.equal(getResponse.status, 200);
  assert.equal(getResponse.body.post.votes, 0);
});

test('GET /api/posts/:PostId/vote returns the users vote', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);

  await request(app)
    .put(`/api/posts/${post.id}/vote`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ value: 1 });

  const response = await request(app)
    .get(`/api/posts/${post.id}/vote`)
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.votes, 1);
  assert.equal(response.body.userVote, 1);
});

test('PUT voting requires authentication', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app)
    .put(`/api/posts/${post.id}/vote`)
    .send({ value: 1 });
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, 'UNAUTHORIZED');
});

test('PUT rejects invalid vote values', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app)
    .put(`/api/posts/${post.id}/vote`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ value: 5 });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_REQUEST');
});

test('PUT returns 404 for a nonexistent post', async () => {
  const user = await _registerUser();
  const response = await request(app)
    .put('/api/posts/2147483647/vote')
    .set('Authorization', `Bearer ${user.token}`)
    .send({ value: 1 });
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'POST_NOT_FOUND');
});
