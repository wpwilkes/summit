import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Exercise the actual local Posts service; no server or extra test framework.
const source = readFileSync(
  new URL('../../src/services/summitPostsService.ts', import.meta.url),
  'utf8',
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const { createSummitPostsService } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
const input = {
  body: '  A discussion about React Native.  ',
  community: 'technology',
};
const photo = {
  uri: 'file:///photos/test.jpg',
  width: 1200,
  height: 800,
  mimeType: 'image/jpeg',
};

test('create a text post with a community, real username, and no title', () => {
  const service = createSummitPostsService('Sarah');
  const post = service.create(input);
  assert.ok(post.id);
  assert.equal(post.body, input.body.trim());
  assert.equal(post.community, 'technology');
  assert.equal(post.author, 'Sarah');
  assert.equal('title' in post, false);
  assert.equal(post.isOwner, true);
  assert.equal(post.voteCount, 0);
  assert.equal(post.userVote, 0);
  assert.equal(post.commentCount, 0);
  assert.deepEqual(service.list(), [post]);
});

test('empty content and invalid communities are rejected without creating posts', () => {
  const service = createSummitPostsService();
  assert.throws(
    () => service.create({ ...input, body: ' ' }),
    /message or add a photo/,
  );
  assert.throws(
    () => service.create({ ...input, community: '' }),
    /valid community/,
  );
  assert.throws(
    () => service.create({ ...input, community: 'not-real' }),
    /valid community/,
  );
  assert.throws(
    () => service.create({ ...input, body: 'a'.repeat(10001) }),
    /10000/,
  );
  assert.equal(service.list().length, 0);
});

test('text with one photo and photo-only posts are supported', () => {
  const service = createSummitPostsService('John');
  const first = service.create({ ...input, photo });
  const second = service.create({ body: '', community: 'sport', photo });
  assert.deepEqual(first.photo, photo);
  assert.equal(second.body, '');
  assert.deepEqual(second.photo, photo);
  assert.deepEqual(
    service.list().map((post) => post.id),
    [second.id, first.id],
  );
});

test('documents and invalid photo metadata are rejected', () => {
  const service = createSummitPostsService();
  for (const invalid of [
    { ...photo, mimeType: 'application/pdf' },
    { ...photo, uri: '' },
    { ...photo, uri: 'javascript:alert(1)' },
    { ...photo, width: 0 },
    { ...photo, height: Number.NaN },
  ])
    assert.throws(
      () => service.create({ ...input, photo: invalid }),
      /valid photo/,
    );
  assert.equal(service.list().length, 0);
});

test('edit changes content/community/photo while preserving identity, comments, and votes', () => {
  const service = createSummitPostsService('Ayman');
  const post = service.create({ ...input, photo });
  service.comment(post.id, 'A comment to keep');
  service.vote(post.id, 1);
  const edited = service.update(post.id, {
    body: '  Updated message  ',
    community: 'health',
  });
  assert.equal(edited.id, post.id);
  assert.equal(edited.createdAt, post.createdAt);
  assert.equal(edited.author, 'Ayman');
  assert.equal(edited.body, 'Updated message');
  assert.equal(edited.community, 'health');
  assert.equal(edited.photo, undefined);
  assert.equal(edited.voteCount, 1);
  assert.equal(edited.userVote, 1);
  assert.equal(edited.commentCount, 1);
  assert.throws(
    () => service.update(post.id, { body: '', community: 'health' }),
    /message or add a photo/,
  );
  assert.deepEqual(service.get(post.id), edited);
});

test('post votes toggle and switch without double counting', () => {
  const service = createSummitPostsService();
  const post = service.create(input);
  for (const [click, score, selected] of [
    [1, 1, 1],
    [1, 0, 0],
    [-1, -1, -1],
    [1, 1, 1],
    [-1, -1, -1],
    [-1, 0, 0],
  ]) {
    const result = service.vote(post.id, click);
    assert.equal(result.voteCount, score);
    assert.equal(result.userVote, selected);
  }
  assert.throws(() => service.vote(post.id, 7), /Vote must/);
  assert.equal(service.get(post.id).voteCount, 0);
});

test('deleting a post removes its comments and leaves other posts intact', () => {
  const service = createSummitPostsService();
  const first = service.create(input);
  const second = service.create(input);
  const comment = service.comment(first.id, 'Delete with the post');
  service.remove(first.id);
  assert.deepEqual(service.list(), [second]);
  assert.throws(() => service.get(first.id), /Post not found/);
  assert.throws(() => service.comments(first.id), /Post not found/);
  assert.throws(
    () => service.voteComment(first.id, comment.id, 1),
    /Post not found/,
  );
});

test('returned objects cannot mutate the store and a new session starts empty', () => {
  const service = createSummitPostsService('u/John');
  const post = service.create({ ...input, photo });
  assert.equal(post.author, 'John');
  post.photo.uri = 'file:///changed.jpg';
  post.body = 'tampered';
  assert.equal(service.get(post.id).photo.uri, photo.uri);
  assert.equal(service.get(post.id).body, input.body.trim());
  assert.equal(createSummitPostsService('Sarah').list().length, 0);
});
