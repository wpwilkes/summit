import app from '../../src/app';
import { registerVerifiedUser } from './helpers/register-verified-user.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

// A real 1x1 PNG picture, so the server sees genuine PNG bytes.
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

// What the fake OpenRouter was asked, so tests can check the request.
type SentRequest = {
  url: string;
  body: {
    model: string;
    reasoning?: { enabled?: boolean };
    messages: {
      role: string;
      content:
        string | { type: string; text?: string; image_url?: { url: string } }[];
    }[];
  };
};

// A word that no other test or seed data will ever use.
function _uniqueWord(): string {
  return `zq${randomUUID().replace(/-/g, '').slice(0, 10)}`;
}

async function _createCommunity(token: string): Promise<number> {
  const name = `img_${randomUUID().slice(0, 8)}`;
  const response = await request(app)
    .post('/api/communities')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, description: 'Image search test community' });
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

// Put an environment variable back the way it was before the test.
function _restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
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
  const realVisionModel = process.env.OPENROUTER_VISION_MODEL;
  const sent: SentRequest[] = [];
  process.env.OPENROUTER_API_KEY = 'test-key';
  process.env.OPENROUTER_VISION_MODEL = 'test/vision-model';
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
    _restoreEnv('OPENROUTER_API_KEY', realKey);
    _restoreEnv('OPENROUTER_VISION_MODEL', realVisionModel);
  }
}

function _aiReply(text: string): Response {
  return new Response(
    JSON.stringify({ choices: [{ message: { content: text } }] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

function _searchByImage(token: string | undefined, image = TINY_PNG) {
  const call = request(app)
    .post('/api/search/image')
    .set('Content-Type', 'image/png');
  if (token) {
    call.set('Authorization', `Bearer ${token}`);
  }
  return call.send(image);
}

test('POST /api/search/image finds posts by title, text and comments', async () => {
  const user = await registerVerifiedUser('imgsearch');
  const inTitle = _uniqueWord();
  const inBody = _uniqueWord();
  const inComment = _uniqueWord();

  const titlePost = await _createPost(
    user.token,
    `Trip to ${inTitle} today`,
    'Lovely day out.',
  );
  const bodyPost = await _createPost(
    user.token,
    'Weekend plans',
    `We will walk along the ${inBody} river.`,
  );
  const commentPost = await _createPost(
    user.token,
    'Any tips?',
    'Looking for advice.',
  );
  await _createComment(user.token, commentPost.id, `Try the ${inComment}!`);
  const otherPost = await _createPost(
    user.token,
    'Nothing related',
    'This post mentions none of the words.',
  );

  // The AI answers in mixed case, with a plural and a repeated word.
  await _withFakeOpenRouter(
    () =>
      _aiReply(
        `${inTitle.toUpperCase()}, ${inBody}s, ${inComment}, ${inTitle}`,
      ),
    async (sent) => {
      const response = await _searchByImage(user.token);

      assert.equal(response.status, 200);
      assert.deepEqual(response.body.keywords, [
        inTitle,
        `${inBody}s`,
        inComment,
      ]);
      const ids = response.body.posts.map((post: { id: number }) => post.id);
      assert.ok(ids.includes(titlePost.id), 'matches the post title');
      assert.ok(ids.includes(bodyPost.id), 'matches the post text');
      assert.ok(ids.includes(commentPost.id), 'matches a comment');
      assert.ok(!ids.includes(otherPost.id), 'skips unrelated posts');

      // The picture was sent to the vision model, without "thinking" first.
      assert.equal(sent.length, 1);
      assert.equal(
        sent[0].url,
        'https://openrouter.ai/api/v1/chat/completions',
      );
      assert.equal(sent[0].body.model, 'test/vision-model');
      assert.deepEqual(sent[0].body.reasoning, { enabled: false });
      const parts = sent[0].body.messages[1].content;
      assert.ok(Array.isArray(parts));
      const imagePart = parts.find((part) => part.type === 'image_url');
      assert.equal(
        imagePart?.image_url?.url,
        `data:image/png;base64,${TINY_PNG.toString('base64')}`,
      );
    },
  );
});

test('POST /api/search/image ignores deleted comments', async () => {
  const user = await registerVerifiedUser('imgsearch');
  const word = _uniqueWord();
  const post = await _createPost(user.token, 'Old thread', 'Nothing here.');
  const comment = await _createComment(user.token, post.id, `About ${word}`);
  const removed = await request(app)
    .delete(`/api/comments/${comment.id}`)
    .set('Authorization', `Bearer ${user.token}`);
  assert.ok(removed.status === 200 || removed.status === 204);

  await _withFakeOpenRouter(
    () => _aiReply(word),
    async () => {
      const response = await _searchByImage(user.token);

      assert.equal(response.status, 200);
      const ids = response.body.posts.map((item: { id: number }) => item.id);
      assert.ok(!ids.includes(post.id));
    },
  );
});

test('POST /api/search/image returns no posts when the AI sees nothing useful', async () => {
  const user = await registerVerifiedUser('imgsearch');

  await _withFakeOpenRouter(
    () => _aiReply('NONE'),
    async () => {
      const response = await _searchByImage(user.token);

      assert.equal(response.status, 200);
      assert.deepEqual(response.body.keywords, []);
      assert.deepEqual(response.body.posts, []);
    },
  );
});

test('POST /api/search/image uses OPENROUTER_MODEL when no vision model is set', async () => {
  const user = await registerVerifiedUser('imgsearch');
  const realModel = process.env.OPENROUTER_MODEL;

  await _withFakeOpenRouter(
    () => _aiReply(_uniqueWord()),
    async (sent) => {
      delete process.env.OPENROUTER_VISION_MODEL;
      process.env.OPENROUTER_MODEL = 'test/fallback-model';
      try {
        const response = await _searchByImage(user.token);

        assert.equal(response.status, 200);
        assert.equal(sent[0].body.model, 'test/fallback-model');
      } finally {
        _restoreEnv('OPENROUTER_MODEL', realModel);
      }
    },
  );
});

test('POST /api/search/image requires login', async () => {
  const response = await _searchByImage(undefined);

  assert.equal(response.status, 401);
});

test('POST /api/search/image rejects files that are not images', async () => {
  const user = await registerVerifiedUser('imgsearch');

  const response = await request(app)
    .post('/api/search/image')
    .set('Authorization', `Bearer ${user.token}`)
    .set('Content-Type', 'text/plain')
    .send('hello');

  _assertApiError(response, 415, 'INVALID_IMAGE_TYPE');
});

test('POST /api/search/image rejects a file that is not really the type it claims', async () => {
  const user = await registerVerifiedUser('imgsearch');

  const response = await _searchByImage(
    user.token,
    Buffer.from('this is not a png'),
  );

  _assertApiError(response, 415, 'INVALID_IMAGE_TYPE');
});

test('POST /api/search/image rejects images over 5 MB', async () => {
  const user = await registerVerifiedUser('imgsearch');
  const huge = Buffer.concat([TINY_PNG, Buffer.alloc(5 * 1024 * 1024)]);

  const response = await _searchByImage(user.token, huge);

  _assertApiError(response, 413, 'IMAGE_TOO_LARGE');
});

test('POST /api/search/image explains when the AI service fails', async () => {
  const user = await registerVerifiedUser('imgsearch');

  await _withFakeOpenRouter(
    () => new Response('upstream error', { status: 500 }),
    async () => {
      const response = await _searchByImage(user.token);

      _assertApiError(response, 502, 'IMAGE_SEARCH_FAILED');
    },
  );
});

test('POST /api/search/image explains when no API key is set', async () => {
  const user = await registerVerifiedUser('imgsearch');
  const realKey = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  try {
    const response = await _searchByImage(user.token);

    _assertApiError(response, 503, 'IMAGE_SEARCH_UNAVAILABLE');
  } finally {
    _restoreEnv('OPENROUTER_API_KEY', realKey);
  }
});
