import app from '../../src/app';
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

async function _createPost(token: string) {
  const communityResponse = await request(app)
    .post('/api/communities')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `test_${randomUUID().slice(0, 8)}`,
      description: 'Comment voting test community',
    });
  assert.equal(communityResponse.status, 201);

  const response = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      communityId: communityResponse.body.community.id,
      title: 'Comment voting test',
      body: 'Testing comment votes.',
    });
  return response.body.post;
}

async function _createComment(postId: number, token: string) {
  const response = await request(app)
    .post(`/api/posts/${postId}/comments`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      body: 'Test comment',
    });
  return response.body.comment;
}

async function _registerUser() {
  const suffix = randomUUID().slice(0, 8);
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: `votetest-${suffix}@example.com`,
      username: `votetest${suffix}`,
      password: 'securepass123',
    });
  return {
    id: response.body.user.id as number,
    token: response.body.token as string,
  };
}

async function _voteComment(
  commentId: number,
  token: string,
  value: -1 | 0 | 1,
) {
  return request(app)
    .put(`/api/comments/${commentId}/vote`)
    .set('Authorization', `Bearer ${token}`)
    .send({ value });
}

test('PUT upvotes a comment', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  const response = await _voteComment(comment.id, user.token, 1);
  assert.equal(response.status, 200);
  assert.equal(response.body.votes, 1);
  assert.equal(response.body.userVote, 1);
});

test('PUT downvotes a comment', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  const response = await _voteComment(comment.id, user.token, -1);
  assert.equal(response.status, 200);
  assert.equal(response.body.votes, -1);
  assert.equal(response.body.userVote, -1);
});

test('PUT voting twice does not duplicate a vote', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  const first = await _voteComment(comment.id, user.token, 1);
  const second = await _voteComment(comment.id, user.token, 1);
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(second.body.votes, 1);
  assert.equal(second.body.userVote, 1);
});

test('PUT switches an upvote to a downvote', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  await _voteComment(comment.id, user.token, 1);
  const response = await _voteComment(comment.id, user.token, -1);
  assert.equal(response.status, 200);
  assert.equal(response.body.votes, -1);
  assert.equal(response.body.userVote, -1);
});

test('PUT switches a downvote to an upvote', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  await _voteComment(comment.id, user.token, -1);
  const response = await _voteComment(comment.id, user.token, 1);
  assert.equal(response.status, 200);
  assert.equal(response.body.votes, 1);
  assert.equal(response.body.userVote, 1);
});

test('PUT removes an existing vote', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  await _voteComment(comment.id, user.token, 1);
  const response = await _voteComment(comment.id, user.token, 0);
  assert.equal(response.status, 200);
  assert.equal(response.body.votes, 0);
  assert.equal(response.body.userVote, 0);
});

test('PUT aggregates votes from different users', async () => {
  const author = await _registerUser();
  const voter1 = await _registerUser();
  const voter2 = await _registerUser();
  const post = await _createPost(author.token);
  const comment = await _createComment(post.id, author.token);
  const first = await _voteComment(comment.id, voter1.token, 1);
  assert.equal(first.status, 200);
  assert.equal(first.body.votes, 1);
  const second = await _voteComment(comment.id, voter2.token, -1);
  assert.equal(second.status, 200);
  assert.equal(second.body.votes, 0);
  const getResponse = await request(app).get(`/api/posts/${post.id}/comments`);
  assert.equal(getResponse.status, 200);
  const updatedComment = getResponse.body.comments.find(
    (c: { id: number }) => c.id === comment.id,
  );
  assert.equal(updatedComment.votes, 0);
});

test('GET returns the authenticated users vote', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  await _voteComment(comment.id, user.token, 1);
  const response = await request(app)
    .get(`/api/comments/${comment.id}/vote`)
    .set('Authorization', `Bearer ${user.token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.votes, 1);
  assert.equal(response.body.userVote, 1);
});

test('GET returns zero when user has not voted', async () => {
  const author = await _registerUser();
  const otherUser = await _registerUser();
  const post = await _createPost(author.token);
  const comment = await _createComment(post.id, author.token);
  await _voteComment(comment.id, author.token, 1);
  const response = await request(app)
    .get(`/api/comments/${comment.id}/vote`)
    .set('Authorization', `Bearer ${otherUser.token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.votes, 1);
  assert.equal(response.body.userVote, 0);
});

test('PUT requires authentication', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  const response = await request(app)
    .put(`/api/comments/${comment.id}/vote`)
    .send({ value: 1 });
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, 'UNAUTHORIZED');
});

test('GET requires authentication', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  const response = await request(app).get(`/api/comments/${comment.id}/vote`);
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, 'UNAUTHORIZED');
});

test('PUT rejects invalid vote values', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  const response = await request(app)
    .put(`/api/comments/${comment.id}/vote`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ value: 5 });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_REQUEST');
});

test('PUT returns 404 for a missing comment', async () => {
  const user = await _registerUser();
  const response = await _voteComment(2147483647, user.token, 1);
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'COMMENT_NOT_FOUND');
});

test('GET returns 404 for a missing comment', async () => {
  const user = await _registerUser();
  const response = await request(app)
    .get('/api/comments/2147483647/vote')
    .set('Authorization', `Bearer ${user.token}`);
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'COMMENT_NOT_FOUND');
});

test('PUT rejects votes on a deleted comment', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const comment = await _createComment(post.id, user.token);
  const deleteResponse = await request(app)
    .delete(`/api/comments/${comment.id}`)
    .set('Authorization', `Bearer ${user.token}`);
  assert.equal(deleteResponse.status, 200);
  const response = await _voteComment(comment.id, user.token, 1);
  assert.equal(response.status, 409);
  assert.equal(response.body.error.code, 'COMMENT_DELETED');
});

test('PUT can vote on nested replies', async () => {
  const user = await _registerUser();
  const post = await _createPost(user.token);
  const parent = await _createComment(post.id, user.token);
  const replyResponse = await request(app)
    .post(`/api/comments/${parent.id}/replies`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      body: 'Nested reply',
    });
  assert.equal(replyResponse.status, 201);
  const reply = replyResponse.body.comment;
  const response = await _voteComment(reply.id, user.token, 1);
  assert.equal(response.status, 200);
  assert.equal(response.body.votes, 1);
  assert.equal(response.body.userVote, 1);
});
