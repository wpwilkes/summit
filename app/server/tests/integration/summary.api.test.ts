import app from '../../src/app';
import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';

test('POST /api/summarize returns a summary for a post with comments', async () => {
  const response = await request(app)
    .post('/api/summarize')
    .send({
      title: 'Test',
      description: 'Data',
      comments: ['Nice post', 'I agree with this'],
    });
  assert.equal(response.status, 200);
  assert.equal(typeof response.body.summary, 'string');
  assert.match(response.body.summary, /2 comments so far/);
});

test('POST /api/summarize works when comments are left out', async () => {
  const response = await request(app)
    .post('/api/summarize')
    .send({ title: 'Test', description: 'Data' });
  assert.equal(response.status, 200);
  assert.match(response.body.summary, /No comments yet/);
});

test('POST /api/summarize returns 400 when the title is missing', async () => {
  const response = await request(app)
    .post('/api/summarize')
    .send({ description: 'Data' });
  assert.equal(response.status, 400);
  assert.equal(typeof response.body.error, 'string');
});
