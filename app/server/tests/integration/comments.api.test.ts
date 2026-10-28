import app from '../../src/app';
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

function _assertApiError(
  response: {
    status: number;
    body: {
      error?: {
        code?: string;
      };
    };
  },
  status: number,
  code: string,
) {
  assert.equal(response.status, status);
  assert.equal(response.body.error?.code, code);
}

async function _createComment(
  postId: number,
  token: string,
  body = 'Test comment',
) {
  const response = await request(app)
    .post(`/api/posts/${postId}/comments`)
    .set('Authorization', `Bearer ${token}`)
    .send({ body });
  assert.equal(response.status, 201);
  return response.body.comment;
}

async function _createPost(token: string) {
  const communityName = `test_${randomUUID().slice(0, 8)}`;
  const communityResponse = await request(app)
    .post('/api/communities')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: communityName, description: 'Test community' });
  assert.equal(communityResponse.status, 201);
  const communityId = communityResponse.body.community.id;
  const response = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      communityId,
      title: 'Test post',
      body: 'Testing comments.',
    });
  assert.equal(response.status, 201);
  return response.body.post;
}

async function _createReply(
  parentId: number,
  token: string,
  body = 'Test reply',
) {
  const response = await request(app)
    .post(`/api/comments/${parentId}/replies`)
    .set('Authorization', `Bearer ${token}`)
    .send({ body });
  assert.equal(response.status, 201);
  return response.body.comment;
}

async function _registerUser() {
  const suffix = randomUUID().slice(0, 8);
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: `commenttest-${suffix}@example.com`,
      username: `comment${suffix}`,
      password: 'securepass123',
    });
  assert.equal(response.status, 201);
  return {
    id: response.body.user.id as number,
    token: response.body.token as string,
  };
}

test('POST creates a comment on a post', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token, 'My first comment');
  assert.equal(comment.postId, post.id);
  assert.equal(comment.authorId, user.id);
  assert.equal(comment.body, 'My first comment');
  assert.equal(comment.parentId, null);
  assert.equal(comment.votes, 0);
  assert.equal(comment.deleted, false);
  assert.equal(typeof comment.id, 'number');
});

test('POST comment returns 401 without a token', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app)
    .post(`/api/posts/${post.id}/comments`)
    .send({ body: 'Unauthorized comment' });
  _assertApiError(response, 401, 'UNAUTHORIZED');
});

test('POST comment returns 400 for empty body', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app)
    .post(`/api/posts/${post.id}/comments`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ body: '' });
  _assertApiError(response, 400, 'INVALID_REQUEST');
});

test('POST comment returns 404 for missing post', async () => {
  const user = await _registerUser();
  const response = await request(app)
    .post('/api/posts/2147483647/comments')
    .set('Authorization', `Bearer ${user.token}`)
    .send({ body: 'Test comment' });
  _assertApiError(response, 404, 'POST_NOT_FOUND');
});

test('GET returns an empty array for a post without comments', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const response = await request(app).get(`/api/posts/${post.id}/comments`);
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.comments, []);
});

test('GET returns comments and replies for a post', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  const reply = await _createReply(comment.id, user.token);
  const response = await request(app).get(`/api/posts/${post.id}/comments`);
  assert.equal(response.status, 200);
  const comments = response.body.comments as Array<{
    id: number;
    parentId: number | null;
  }>;
  assert.equal(comments.length, 2);
  assert.ok(comments.some((c) => c.id === comment.id && c.parentId === null));
  assert.ok(
    comments.some((c) => c.id === reply.id && c.parentId === comment.id),
  );
});

test('GET comments returns 404 for missing post', async () => {
  const response = await request(app).get('/api/posts/2147483647/comments');
  _assertApiError(response, 404, 'POST_NOT_FOUND');
});

test('POST reply creates a nested comment', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const parent = await _createComment(post.id, user.token);
  const reply = await _createReply(parent.id, user.token, 'Reply to parent');
  assert.equal(reply.postId, post.id);
  assert.equal(reply.parentId, parent.id);
  assert.equal(reply.authorId, user.id);
  assert.equal(reply.body, 'Reply to parent');
});

test('POST reply supports multiple nesting levels', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const parent = await _createComment(post.id, user.token);
  const reply = await _createReply(parent.id, user.token);
  const nestedReply = await _createReply(reply.id, user.token);
  assert.equal(nestedReply.parentId, reply.id);
  assert.equal(nestedReply.postId, post.id);
});

test('POST reply returns 404 for missing parent', async () => {
  const user = await _registerUser();
  const response = await request(app)
    .post('/api/comments/2147483647/replies')
    .set('Authorization', `Bearer ${user.token}`)
    .send({ body: 'Reply to missing comment' });
  _assertApiError(response, 404, 'COMMENT_NOT_FOUND');
});

test('POST reply returns 401 without authentication', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const parent = await _createComment(post.id, user.token);
  const response = await request(app)
    .post(`/api/comments/${parent.id}/replies`)
    .send({ body: 'Unauthorized reply' });
  _assertApiError(response, 401, 'UNAUTHORIZED');
});

test('PATCH updates the authors comment', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  const response = await request(app)
    .patch(`/api/comments/${comment.id}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ body: 'Updated comment' });
  assert.equal(response.status, 200);
  assert.equal(response.body.comment.body, 'Updated comment');
  const getResponse = await request(app).get(`/api/posts/${post.id}/comments`);
  const updated = getResponse.body.comments.find(
    (c: { id: number }) => c.id === comment.id,
  );
  assert.equal(updated.body, 'Updated comment');
});

test('PATCH rejects edits from another user', async () => {
  const author = await _registerUser();
  const otherUser = await _registerUser();
  const post = await _createPost(author.token);
  const comment = await _createComment(post.id, author.token);
  const response = await request(app)
    .patch(`/api/comments/${comment.id}`)
    .set('Authorization', `Bearer ${otherUser.token}`)
    .send({ body: 'Unauthorized edit' });
  _assertApiError(response, 403, 'FORBIDDEN');
});

test('PATCH returns 400 for an empty body', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  const response = await request(app)
    .patch(`/api/comments/${comment.id}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ body: '' });
  _assertApiError(response, 400, 'INVALID_REQUEST');
});

test('DELETE soft-deletes a comment but preserves replies', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const parent = await _createComment(post.id, user.token, 'Original text');
  const reply = await _createReply(parent.id, user.token, 'Preserved reply');
  const response = await request(app)
    .delete(`/api/comments/${parent.id}`)
    .set('Authorization', `Bearer ${user.token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  const getResponse = await request(app).get(`/api/posts/${post.id}/comments`);
  const comments = getResponse.body.comments as Array<{
    id: number;
    parentId: number | null;
    body: string;
    deleted: boolean;
  }>;
  const deletedParent = comments.find((c) => c.id === parent.id);
  const preservedReply = comments.find((c) => c.id === reply.id);
  assert.equal(deletedParent?.deleted, true);
  assert.equal(deletedParent?.body, '[deleted]');
  assert.equal(preservedReply?.parentId, parent.id);
  assert.equal(preservedReply?.body, 'Preserved reply');
});

test('DELETE rejects deletion by another user', async () => {
  const author = await _registerUser();
  const otherUser = await _registerUser();
  const post = await _createPost(author.token);
  const comment = await _createComment(post.id, author.token);
  const response = await request(app)
    .delete(`/api/comments/${comment.id}`)
    .set('Authorization', `Bearer ${otherUser.token}`);
  _assertApiError(response, 403, 'FORBIDDEN');
});

test('DELETE returns 409 for already deleted comment', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  await request(app)
    .delete(`/api/comments/${comment.id}`)
    .set('Authorization', `Bearer ${user.token}`);
  const response = await request(app)
    .delete(`/api/comments/${comment.id}`)
    .set('Authorization', `Bearer ${user.token}`);
  _assertApiError(response, 409, 'COMMENT_DELETED');
});

test('PATCH rejects edits to a deleted comment', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  await request(app)
    .delete(`/api/comments/${comment.id}`)
    .set('Authorization', `Bearer ${user.token}`);
  const response = await request(app)
    .patch(`/api/comments/${comment.id}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ body: 'Edited after deletion' });
  _assertApiError(response, 409, 'COMMENT_DELETED');
});
