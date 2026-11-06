import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';
import * as contracts from '@summit/shared';

// Load the actual mobile service and real shared schemas. Only the HTTP
// transport and native token/device storage are replaced in these tests.
// These are frontend service tests, not live server/database integration tests.
function setup(storage = new Map()) {
  const requests = [];
  const state = {
    token: 'test-token',
    fail: undefined,
    wait: undefined,
    feedSnapshot: undefined,
    savedSummary: null,
    malformedVote: false,
    storageFailure: false,
    postVote: 0,
    commentVote: 0,
    posts: [{
      id: 1, communityId: 1, communityName: 'education', title: 'First',
      body: 'First post', authorId: 7, authorUsername: 'Ayman',
      votes: 10, commentCount: 1, createdAt: '2026-11-05T12:00:00.000Z',
    }],
    comments: [{
      id: 1, postId: 1, authorId: 7, authorUsername: 'Ayman', parentId: null,
      body: 'First comment', votes: 3, deleted: false,
      createdAt: '2026-11-05T12:01:00.000Z',
    }],
  };
  const response = (body, status = 200) => new Response(JSON.stringify(body), { status });
  const fetch = async (url, options) => {
    const pathname = new URL(url).pathname;
    const method = options.method;
    const body = options.body ? JSON.parse(options.body) : undefined;
    requests.push({ url, pathname, method, body, headers: options.headers });
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    if (body !== undefined) assert.equal(options.headers['Content-Type'], 'application/json');
    if (state.wait) await state.wait(pathname, method);
    if (state.fail?.(pathname, method)) return response({ error: { message: 'Vote rejected.' } }, 500);
    if (pathname === '/api/posts/1/summary') {
      assert.equal(body, undefined);
      assert.equal(options.headers['Content-Type'], undefined);
      if (method === 'POST') {
        state.savedSummary = {
          id: 1, postId: 1, commentCount: state.comments.length,
          summary: 'Ayman and another commenter discuss the topic.',
          createdAt: '2026-11-05T13:00:00.000Z',
        };
      } else assert.equal(method, 'GET');
      return response({ summary: state.savedSummary });
    }
    if (pathname.endsWith('/vote')) {
      const isPost = pathname.startsWith('/api/posts/');
      const entity = isPost ? state.posts[0] : state.comments[0];
      const voteKey = isPost ? 'postVote' : 'commentVote';
      if (method === 'PUT') {
        const contract = isPost ? contracts.POSTS_CONTRACTS : contracts.COMMENTS_CONTRACTS;
        contract.vote.requestBody.parse(body);
        assert.deepEqual(Object.keys(body), ['value']);
        if (state.malformedVote) return response({ votes: 'invalid', userVote: 1 });
        entity.votes += body.value - state[voteKey];
        state[voteKey] = body.value;
      } else assert.equal(method, 'GET');
      return response({ votes: entity.votes, userVote: state[voteKey] });
    }
    if (pathname === contracts.COMMUNITIES_CONTRACTS.getAll.path) {
      return response({ communities: [{ id: 1, name: 'education' }] });
    }
    if (pathname === '/api/posts' && method === 'GET') {
      const snapshot = response({ posts: state.posts });
      if (state.feedSnapshot) await state.feedSnapshot();
      return snapshot;
    }
    if (pathname === '/api/posts' && method === 'POST') {
      contracts.POSTS_CONTRACTS.create.requestBody.parse(body);
      const post = { ...state.posts[0], ...body, id: 2, votes: 0, commentCount: 0 };
      state.posts.push(post);
      return response({ post }, 201);
    }
    if (pathname === '/api/posts/1/comments' && method === 'GET') {
      return response({ comments: state.comments });
    }
    if (pathname === '/api/posts/1/comments' && method === 'POST') {
      contracts.COMMENTS_CONTRACTS.create.requestBody.parse(body);
      const comment = { ...state.comments[0], ...body, id: 2, votes: 0 };
      state.comments.push(comment);
      state.posts[0].commentCount++;
      return response({ comment }, 201);
    }
    const match = pathname.match(/^\/api\/(posts|comments)\/(\d+)$/);
    if (match && method === 'PATCH') {
      const isPost = match[1] === 'posts';
      (isPost ? contracts.POSTS_CONTRACTS : contracts.COMMENTS_CONTRACTS).update.requestBody.parse(body);
      const entity = (isPost ? state.posts : state.comments).find((item) => item.id === Number(match[2]));
      Object.assign(entity, body);
      return response({ [isPost ? 'post' : 'comment']: entity });
    }
    if (match && method === 'DELETE') {
      const key = match[1] === 'posts' ? 'posts' : 'comments';
      state[key] = state[key].filter((item) => item.id !== Number(match[2]));
      return response({ success: true });
    }
    throw new Error(`Unexpected request: ${method} ${pathname}`);
  };
  const nativeStorage = {
    async getItem(key) {
      if (state.storageFailure) throw new Error('Device storage unavailable');
      return storage.get(key) ?? null;
    },
    async setItem(key, value) {
      if (state.storageFailure) throw new Error('Device storage unavailable');
      storage.set(key, value);
    },
  };
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    });
    const require = (specifier) => {
      if (specifier === '@summit/shared') return contracts;
      if (specifier === '../utils/tokenStorage') return { getAuthToken: async () => state.token };
      if (specifier === '@react-native-async-storage/async-storage') return nativeStorage;
      if (specifier.startsWith('.')) return load(path.resolve(path.dirname(filename), `${specifier}.ts`));
      throw new Error(`Unexpected dependency: ${specifier}`);
    };
    new Function('require', 'module', 'exports', 'fetch', 'process', outputText)(
      require, module, module.exports, fetch,
      { env: { EXPO_PUBLIC_API_URL: 'http://summit.test:3000/' } },
    );
    return module.exports;
  }
  const { createBackendSummitPostsService } = load(fileURLToPath(
    new URL('../../src/services/backendSummitPostsService.ts', import.meta.url),
  ));
  const create = (id = 7) => createBackendSummitPostsService({ id, username: 'Ayman' });
  return { service: create(), create, state, storage, requests };
}

test('post vote calls authenticated GET and PUT, toggles, switches and uses server totals', async () => {
  const { service, requests } = setup();
  await service.load();
  for (const [click, userVote] of [[1, 1], [1, 0], [-1, -1], [1, 1], [-1, -1], [-1, 0]]) {
    requests.length = 0;
    await service.vote('1', click);
    assert.deepEqual(requests.map(({ method, pathname }) => [method, pathname]), [
      ['GET', '/api/posts/1/vote'], ['PUT', '/api/posts/1/vote'],
    ]);
    assert.deepEqual(requests[1].body, { value: userVote });
    assert.equal(service.get('1').userVote, userVote);
    assert.equal(service.get('1').voteCount, 10 + userVote);
  }
});

test('existing comment voting remains a PUT to its own endpoint', async () => {
  const { service, requests } = setup();
  await service.load();
  await service.loadComments('1');
  for (const [click, userVote] of [[1, 1], [1, 0], [-1, -1], [1, 1], [-1, -1], [-1, 0]]) {
    requests.length = 0;
    await service.voteComment('1', '1', click);
    assert.deepEqual(requests.map(({ method, pathname }) => [method, pathname]), [
      ['PUT', '/api/comments/1/vote'],
    ]);
    assert.equal(service.comments('1')[0].voteCount, 3 + userVote);
    assert.equal(service.comments('1')[0].userVote, userVote);
    assert.equal(service.get('1').voteCount, 10);
  }
});

test('a vote changed elsewhere is read from the backend before toggling', async () => {
  const { service, state, requests } = setup();
  await service.load();
  state.postVote = 1;
  state.posts[0].votes = 11;
  await service.vote('1', 1);
  assert.deepEqual(requests.at(-1).body, { value: 0 });
  assert.equal(service.get('1').voteCount, 10);
});

test('failed or malformed vote responses do not manufacture successful local votes', async () => {
  const { service, state } = setup();
  await service.load();
  await service.loadComments('1');
  state.fail = (_path, method) => method === 'PUT';
  await assert.rejects(service.vote('1', 1), /Vote rejected/);
  await assert.rejects(service.voteComment('1', '1', 1), /Vote rejected/);
  assert.equal(service.get('1').voteCount, 10);
  assert.equal(service.comments('1')[0].voteCount, 3);
  state.fail = undefined;
  state.malformedVote = true;
  await assert.rejects(service.vote('1', 1), /invalid vote/);
  assert.equal(service.get('1').userVote, 0);
});

test('missing authentication sends no network request and invalid click values are rejected', async () => {
  const { service, state, requests } = setup();
  state.token = null;
  await assert.rejects(service.vote('1', 1), /sign in again/);
  await assert.rejects(service.voteComment('1', '1', 1), /sign in again/);
  assert.equal(requests.length, 0);
  await assert.rejects(service.vote('1', 0), /Vote must/);
});

test('rapid repeat taps cannot send duplicate in-flight vote writes', async () => {
  const { service, state, requests } = setup();
  await service.load();
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  state.wait = async (_path, method) => { if (method === 'PUT') await gate; };
  const first = service.vote('1', 1);
  const second = service.vote('1', 1);
  release();
  await Promise.all([first, second]);
  assert.equal(requests.filter(({ method }) => method === 'PUT').length, 1);
  assert.equal(service.get('1').voteCount, 11);
});

test('anonymous post choice stays local, survives reload and can be turned off', async () => {
  const { service, create, requests } = setup();
  await service.load();
  await service.create({ body: 'My post', community: 'education', isAnonymous: true });
  const sent = requests.find(({ method }) => method === 'POST');
  assert.deepEqual(sent.body, { communityId: 1, title: 'My post', body: 'My post' });
  assert.equal(service.get('2').isAnonymous, true);
  assert.equal(service.get('2').author, 'Ayman');
  assert.equal(service.get('2').isOwner, true);
  const reloaded = create();
  await reloaded.load();
  assert.equal(reloaded.get('2').isAnonymous, true);
  await reloaded.update('2', { body: 'Edited', community: 'education', isAnonymous: false });
  assert.equal(reloaded.get('2').isAnonymous, false);
  assert.ok(requests.filter(({ method }) => method === 'PATCH').every(({ body }) => !('isAnonymous' in body)));
});

test('a delayed background feed response cannot overwrite a newer successful post vote', async () => {
  const { service, state } = setup();
  await service.load();
  let release;
  let captured;
  const gate = new Promise((resolve) => { release = resolve; });
  const ready = new Promise((resolve) => { captured = resolve; });
  state.feedSnapshot = async () => { captured(); await gate; };
  const refresh = service.load();
  await ready;
  await service.vote('1', 1);
  release();
  await refresh;
  assert.equal(service.get('1').userVote, 1);
  assert.equal(service.get('1').voteCount, 11);
});

test('anonymous comments persist locally, preserve ownership and support editing back to a name', async () => {
  const { service, create, requests } = setup();
  await service.load();
  await service.loadComments('1');
  await service.comment('1', '  Hello  ', true);
  assert.deepEqual(requests.find(({ method }) => method === 'POST').body, { body: 'Hello' });
  assert.equal(service.comments('1')[1].isAnonymous, true);
  assert.equal(service.comments('1')[1].isOwner, true);
  const reloaded = create();
  await reloaded.loadComments('1');
  assert.equal(reloaded.comments('1')[1].isAnonymous, true);
  await reloaded.updateComment('1', '2', 'Changed', false);
  assert.equal(reloaded.comments('1')[1].isAnonymous, false);
  assert.deepEqual(requests.find(({ method }) => method === 'PATCH').body, { body: 'Changed' });
});

test('anonymous choices do not transfer to another account or another device', async () => {
  const { service, create, state } = setup();
  await service.load();
  await service.update('1', { body: 'Private display', community: 'education', isAnonymous: true });
  const otherAccount = create(8);
  await otherAccount.load();
  assert.equal(otherAccount.get('1').isAnonymous, false);
  assert.equal(otherAccount.get('1').isOwner, false);
  const otherDevice = setup();
  otherDevice.state.posts = structuredClone(state.posts);
  await otherDevice.service.load();
  assert.equal(otherDevice.service.get('1').isAnonymous, false);
});

test('device storage failure warns without resubmitting successful content', async () => {
  const { service, state, requests } = setup();
  await service.load();
  state.storageFailure = true;
  await service.create({ body: 'Save once', community: 'education', isAnonymous: true });
  assert.equal(requests.filter(({ method }) => method === 'POST').length, 1);
  assert.equal(service.get('2').isAnonymous, true);
  assert.match(service.getDisplayWarning(), /only for this session/);
});

test('normal display is the default and deleting content removes its local setting', async () => {
  const { service, storage } = setup();
  await service.load();
  assert.equal(service.get('1').isAnonymous, false);
  await service.create({ body: 'Temporary', community: 'education', isAnonymous: true });
  await service.remove('2');
  assert.equal(service.get('2'), undefined);
  assert.deepEqual([...storage.values()].map(JSON.parse), [[]]);
});

test('Jalal summary lookup still returns null when no saved summary exists', async () => {
  const { service, requests } = setup();
  assert.equal(await service.summary('1'), null);
  assert.deepEqual(requests.map(({ method, pathname }) => [method, pathname]), [
    ['GET', '/api/posts/1/summary'],
  ]);
});

test('post voting and local anonymous names preserve summary requests and returned text', async () => {
  const { service, state, requests } = setup();
  await service.load();
  await service.loadComments('1');
  await service.update('1', { body: 'Discussion', community: 'education', isAnonymous: true });
  await service.updateComment('1', '1', 'My comment', true);
  await service.vote('1', 1);
  requests.length = 0;
  const generated = await service.generateSummary('1');
  assert.deepEqual(generated, {
    text: state.savedSummary.summary,
    commentCount: state.comments.length,
    createdAt: state.savedSummary.createdAt,
  });
  assert.equal(generated.text, 'Ayman and another commenter discuss the topic.');
  assert.deepEqual(await service.summary('1'), generated);
  assert.deepEqual(requests.map(({ method, pathname, body }) => [method, pathname, body]), [
    ['POST', '/api/posts/1/summary', undefined],
    ['GET', '/api/posts/1/summary', undefined],
  ]);
  assert.equal(service.get('1').isAnonymous, true);
  assert.equal(service.get('1').voteCount, 11);
});

test('summary request errors keep the existing error behavior and do not change votes', async () => {
  const { service, state } = setup();
  await service.load();
  state.fail = (pathname) => pathname.endsWith('/summary');
  await assert.rejects(service.summary('1'), /Vote rejected/);
  await assert.rejects(service.generateSummary('1'), /Vote rejected/);
  assert.equal(service.get('1').voteCount, 10);
});
