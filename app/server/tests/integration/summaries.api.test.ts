import app from '../../src/app';
import { registerVerifiedUser } from './helpers/register-verified-user.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

// What the fake OpenRouter was asked, so tests can check the prompt.
type SentRequest = {
  url: string;
  body: { model: string; messages: { content: string }[] };
};

async function _createCommunity(token: string): Promise<number> {
  const name = `sum_${randomUUID().slice(0, 8)}`;
  const response = await request(app)
    .post('/api/communities')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, description: 'Summary test community' });
  assert.equal(response.status, 201);
  return response.body.community.id as number;
}

async function _createPost(token: string, title = 'Best pizza in town?') {
  const communityId = await _createCommunity(token);
  const response = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({ communityId, title, body: 'Where do you get your pizza?' });
  assert.equal(response.status, 201);
  return response.body.post;
}

async function _createComment(token: string, postId: number, body: string) {
  const response = await request(app)
    .post(`/api/posts/${postId}/comments`)
    .set('Authorization', `Bearer ${token}`)
    .send({ body });
  assert.equal(response.status, 201);
  return response.body.comment;
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

// Replace the real OpenRouter call with a fake one for the length of a test.
// supertest talks to our app over plain HTTP, so only OpenRouter calls go
// through this fake fetch.
async function _withFakeOpenRouter(
  reply: () => Response | Promise<Response>,
  run: (sent: SentRequest[]) => Promise<void>,
): Promise<void> {
  const realFetch = globalThis.fetch;
  const realKey = process.env.OPENROUTER_API_KEY;
  const sent: SentRequest[] = [];
  process.env.OPENROUTER_API_KEY = 'test-key';
  globalThis.fetch = (async (
    url: string | URL | Request,
    init?: RequestInit,
  ) => {
    sent.push({ url: String(url), body: JSON.parse(String(init?.body)) });
    return reply();
  }) as typeof fetch;
  try {
    await run(sent);
  } finally {
    globalThis.fetch = realFetch;
    if (realKey === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = realKey;
    }
  }
}

function _aiReply(text: string): Response {
  return new Response(
    JSON.stringify({ choices: [{ message: { content: text } }] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

test('GET /api/posts/:postId/summary returns null before any summary exists', async () => {
  const user = await registerVerifiedUser('sumtest');
  const post = await _createPost(user.token);

  const response = await request(app).get(`/api/posts/${post.id}/summary`);

  assert.equal(response.status, 200);
  assert.equal(response.body.summary, null);
});

test('POST /api/posts/:postId/summary creates and saves a summary', async () => {
  const user = await registerVerifiedUser('sumtest');
  const post = await _createPost(user.token);
  await _createComment(user.token, post.id, 'Joe’s Pizza is the best.');

  await _withFakeOpenRouter(
    () => _aiReply('People like Joe’s Pizza.'),
    async (sent) => {
      const response = await request(app)
        .post(`/api/posts/${post.id}/summary`)
        .set('Authorization', `Bearer ${user.token}`);

      assert.equal(response.status, 201);
      assert.equal(response.body.summary.postId, post.id);
      assert.equal(response.body.summary.summary, 'People like Joe’s Pizza.');
      assert.equal(response.body.summary.commentCount, 1);

      // The AI was asked about this exact post and comment, with the cheap model.
      assert.equal(sent.length, 1);
      assert.equal(
        sent[0].url,
        'https://openrouter.ai/api/v1/chat/completions',
      );
      assert.equal(sent[0].body.model, 'google/gemini-2.5-flash-lite');
      const prompt = sent[0].body.messages.map((m) => m.content).join('\n');
      assert.match(prompt, /Best pizza in town\?/);
      assert.match(prompt, /Joe’s Pizza is the best\./);
    },
  );

  // The summary was saved, so reading it needs no AI call.
  const saved = await request(app).get(`/api/posts/${post.id}/summary`);
  assert.equal(saved.status, 200);
  assert.equal(saved.body.summary.summary, 'People like Joe’s Pizza.');
});

test('POST /api/posts/:postId/summary again redoes it with the newest comments', async () => {
  const user = await registerVerifiedUser('sumtest');
  const post = await _createPost(user.token);
  await _createComment(user.token, post.id, 'First comment');

  await _withFakeOpenRouter(
    () => _aiReply('Old summary.'),
    async () => {
      await request(app)
        .post(`/api/posts/${post.id}/summary`)
        .set('Authorization', `Bearer ${user.token}`);
    },
  );

  await _createComment(user.token, post.id, 'A brand new reply');

  await _withFakeOpenRouter(
    () => _aiReply('Updated summary.'),
    async (sent) => {
      const response = await request(app)
        .post(`/api/posts/${post.id}/summary`)
        .set('Authorization', `Bearer ${user.token}`);

      assert.equal(response.status, 201);
      assert.equal(response.body.summary.summary, 'Updated summary.');
      assert.equal(response.body.summary.commentCount, 2);
      const prompt = sent[0].body.messages.map((m) => m.content).join('\n');
      assert.match(prompt, /A brand new reply/);
    },
  );

  const latest = await request(app).get(`/api/posts/${post.id}/summary`);
  assert.equal(latest.body.summary.summary, 'Updated summary.');
});

test('POST /api/posts/:postId/summary skips deleted comments', async () => {
  const user = await registerVerifiedUser('sumtest');
  const post = await _createPost(user.token);
  const comment = await _createComment(
    user.token,
    post.id,
    'Secret removed words',
  );
  await request(app)
    .delete(`/api/comments/${comment.id}`)
    .set('Authorization', `Bearer ${user.token}`);

  await _withFakeOpenRouter(
    () => _aiReply('No comments.'),
    async (sent) => {
      const response = await request(app)
        .post(`/api/posts/${post.id}/summary`)
        .set('Authorization', `Bearer ${user.token}`);

      assert.equal(response.status, 201);
      assert.equal(response.body.summary.commentCount, 0);
      const prompt = sent[0].body.messages.map((m) => m.content).join('\n');
      assert.doesNotMatch(prompt, /Secret removed words/);
    },
  );
});

test('POST /api/posts/:postId/summary returns 401 without a token', async () => {
  const response = await request(app).post('/api/posts/1/summary');
  _assertApiError(response, 401, 'UNAUTHORIZED');
});

test('POST /api/posts/:postId/summary returns 404 for a missing post', async () => {
  const user = await registerVerifiedUser('sumtest');
  const response = await request(app)
    .post('/api/posts/999999999/summary')
    .set('Authorization', `Bearer ${user.token}`);
  _assertApiError(response, 404, 'POST_NOT_FOUND');
});

test('POST /api/posts/:postId/summary returns 400 for an invalid post ID', async () => {
  const user = await registerVerifiedUser('sumtest');
  const response = await request(app)
    .post('/api/posts/abc/summary')
    .set('Authorization', `Bearer ${user.token}`);
  _assertApiError(response, 400, 'INVALID_POST_ID');
});

test('GET /api/posts/:postId/summary returns 404 for a missing post', async () => {
  const response = await request(app).get('/api/posts/999999999/summary');
  _assertApiError(response, 404, 'POST_NOT_FOUND');
});

test('POST /api/posts/:postId/summary returns 503 when no API key is set', async () => {
  const user = await registerVerifiedUser('sumtest');
  const post = await _createPost(user.token);
  const realKey = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  try {
    const response = await request(app)
      .post(`/api/posts/${post.id}/summary`)
      .set('Authorization', `Bearer ${user.token}`);
    _assertApiError(response, 503, 'SUMMARY_UNAVAILABLE');
  } finally {
    if (realKey !== undefined) {
      process.env.OPENROUTER_API_KEY = realKey;
    }
  }
});

test('POST /api/posts/:postId/summary returns 502 when OpenRouter fails', async () => {
  const user = await registerVerifiedUser('sumtest');
  const post = await _createPost(user.token);

  await _withFakeOpenRouter(
    () => new Response('{}', { status: 500 }),
    async () => {
      const response = await request(app)
        .post(`/api/posts/${post.id}/summary`)
        .set('Authorization', `Bearer ${user.token}`);
      _assertApiError(response, 502, 'SUMMARY_FAILED');
    },
  );

  // Nothing was saved by the failed attempt.
  const saved = await request(app).get(`/api/posts/${post.id}/summary`);
  assert.equal(saved.body.summary, null);
});

test('POST /api/posts/:postId/summary returns 502 when OpenRouter sends an empty answer', async () => {
  const user = await registerVerifiedUser('sumtest');
  const post = await _createPost(user.token);

  await _withFakeOpenRouter(
    () => _aiReply('   '),
    async () => {
      const response = await request(app)
        .post(`/api/posts/${post.id}/summary`)
        .set('Authorization', `Bearer ${user.token}`);
      _assertApiError(response, 502, 'SUMMARY_FAILED');
    },
  );
});

test('POST /api/posts/:postId/summary returns 504 when OpenRouter times out', async () => {
  const user = await registerVerifiedUser('sumtest');
  const post = await _createPost(user.token);

  await _withFakeOpenRouter(
    () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      throw error;
    },
    async () => {
      const response = await request(app)
        .post(`/api/posts/${post.id}/summary`)
        .set('Authorization', `Bearer ${user.token}`);
      _assertApiError(response, 504, 'SUMMARY_TIMEOUT');
    },
  );
});
