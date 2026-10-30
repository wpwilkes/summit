import app from '../../src/app.js';
import { registerVerifiedUser } from './helpers/register-verified-user.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==',
  'base64',
);

test('two accounts read shared posts and comments with the correct usernames', async () => {
  const alice = await registerVerifiedUser('alicepost');
  const bob = await registerVerifiedUser('bobpost');
  const community = await request(app).post('/api/communities')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({ name: `post_image_${randomUUID().slice(0, 8)}`, description: '' });
  assert.equal(community.status, 201);
  const created = await request(app).post('/api/posts')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({ communityId: community.body.community.id, title: 'Photo', body: 'Hello Bob' });
  assert.equal(created.status, 201);

  const feed = await request(app).get('/api/posts')
    .set('Authorization', `Bearer ${bob.token}`);
  assert.equal(feed.status, 200);
  const post = feed.body.posts.find((item: { id: number }) => item.id === created.body.post.id);
  assert.ok(post);
  assert.equal(post.authorUsername, alice.username);
  assert.equal(post.communityName, community.body.community.name);
  assert.equal(post.commentCount, 0);

  const replied = await request(app).post(`/api/posts/${post.id}/comments`)
    .set('Authorization', `Bearer ${bob.token}`).send({ body: 'Hi Alice' });
  assert.equal(replied.status, 201);
  const comments = await request(app).get(`/api/posts/${post.id}/comments`);
  assert.equal(comments.status, 200);
  assert.ok(comments.body.comments.some((item: { authorId: number; authorUsername: string }) =>
    item.authorId === bob.id && item.authorUsername === bob.username));
});

test('authenticated image upload returns a URL that persists on an image post', async () => {
  const alice = await registerVerifiedUser('imagepost');
  const community = await request(app).post('/api/communities')
    .set('Authorization', `Bearer ${alice.token}`)
    .send({ name: `image_${randomUUID().slice(0, 8)}`, description: '' });
  assert.equal(community.status, 201);

  const denied = await request(app).post('/api/posts/images')
    .set('Content-Type', 'image/png').send(png);
  assert.equal(denied.status, 401);

  const upload = await request(app).post('/api/posts/images')
    .set('Authorization', `Bearer ${alice.token}`)
    .set('Content-Type', 'image/png').send(png);
  assert.equal(upload.status, 201);
  assert.match(upload.body.photoUrl, /^\/api\/posts\/images\/[0-9a-f-]+\.png$/);
  const fileName = upload.body.photoUrl.split('/').pop();
  assert.ok(fileName);
  try {
    const image = await request(app).get(upload.body.photoUrl);
    assert.equal(image.status, 200);
    assert.match(image.headers['content-type'], /^image\/png/);

    const posted = await request(app).post('/api/posts')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({
        communityId: community.body.community.id,
        title: 'Photo', body: '',
        photoUrl: upload.body.photoUrl, photoWidth: 1, photoHeight: 1,
      });
    assert.equal(posted.status, 201);
    const retrieved = await request(app).get(`/api/posts/${posted.body.post.id}`);
    assert.equal(retrieved.body.post.photoUrl, upload.body.photoUrl);
  } finally {
    await rm(path.join(process.cwd(), 'uploads', 'posts', fileName), { force: true });
  }
});
