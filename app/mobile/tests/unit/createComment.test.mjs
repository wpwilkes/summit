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
const setup = () => {
  const service = createSummitPostsService('Sarah');
  const post = service.create({
    body: 'Share your thoughts.',
    community: 'education',
  });
  return { service, post };
};

test('create comment attaches trimmed text to its post and updates the counter', () => {
  const { service, post } = setup();
  const comment = service.comment(post.id, '  This is useful.  ');
  assert.ok(comment.id);
  assert.equal(comment.postId, post.id);
  assert.equal(comment.body, 'This is useful.');
  assert.equal(comment.author, 'Sarah');
  assert.equal(comment.isOwner, true);
  assert.equal(comment.voteCount, 0);
  assert.equal(comment.userVote, 0);
  assert.deepEqual(service.comments(post.id), [comment]);
  assert.equal(service.get(post.id).commentCount, 1);
});

test('empty and overlong comments are rejected without changing the counter', () => {
  const { service, post } = setup();
  assert.throws(() => service.comment(post.id, ' '), /Comment is required/);
  assert.throws(() => service.comment(post.id, 'x'.repeat(2001)), /2000/);
  assert.equal(service.get(post.id).commentCount, 0);
});

test('edit comment keeps its identity, author, votes, and parent counter', () => {
  const { service, post } = setup();
  const comment = service.comment(post.id, 'Original');
  service.voteComment(post.id, comment.id, 1);
  const updated = service.updateComment(
    post.id,
    comment.id,
    '  Edited comment  ',
  );
  assert.equal(updated.body, 'Edited comment');
  assert.equal(updated.id, comment.id);
  assert.equal(updated.author, comment.author);
  assert.equal(updated.createdAt, comment.createdAt);
  assert.equal(updated.userVote, 1);
  assert.equal(updated.voteCount, 1);
  assert.equal(service.get(post.id).commentCount, 1);
  assert.throws(
    () => service.updateComment(post.id, comment.id, ' '),
    /Comment is required/,
  );
  assert.deepEqual(service.comments(post.id), [updated]);
});

test('delete comment decrements only its own post counter', () => {
  const { service, post } = setup();
  const first = service.comment(post.id, 'Remove this');
  const second = service.comment(post.id, 'Keep this');
  const otherPost = service.create({
    body: 'Another post',
    community: 'sport',
  });
  service.comment(otherPost.id, 'Unrelated');
  service.removeComment(post.id, first.id);
  assert.deepEqual(service.comments(post.id), [second]);
  assert.equal(service.get(post.id).commentCount, 1);
  assert.equal(service.get(otherPost.id).commentCount, 1);
  assert.throws(
    () => service.removeComment(post.id, first.id),
    /Comment not found/,
  );
  service.removeComment(post.id, second.id);
  assert.equal(service.get(post.id).commentCount, 0);
});

test('comment upvote and downvote toggle/switch independently from post votes', () => {
  const { service, post } = setup();
  const comment = service.comment(post.id, 'Vote on this');
  for (const [click, score] of [
    [1, 1],
    [1, 0],
    [-1, -1],
    [1, 1],
    [-1, -1],
    [-1, 0],
  ]) {
    const updated = service.voteComment(post.id, comment.id, click);
    assert.equal(updated.voteCount, score);
    assert.equal(updated.userVote, score);
    assert.equal(service.get(post.id).voteCount, 0);
    assert.equal(service.get(post.id).commentCount, 1);
  }
  assert.throws(() => service.voteComment(post.id, comment.id, 0), /Vote must/);
});

test('missing posts and comments from another post cannot be changed', () => {
  const { service, post } = setup();
  const comment = service.comment(post.id, 'Keep this');
  const other = service.create({ body: 'Other', community: 'health' });
  assert.throws(() => service.comment('missing', 'Hello'), /Post not found/);
  assert.throws(
    () => service.updateComment(other.id, comment.id, 'Wrong parent'),
    /Comment not found/,
  );
  assert.throws(
    () => service.removeComment(other.id, comment.id),
    /Comment not found/,
  );
  assert.throws(
    () => service.voteComment(other.id, comment.id, 1),
    /Comment not found/,
  );
  assert.deepEqual(service.comments(post.id), [comment]);
});

test('returned comment objects cannot silently change stored text or scores', () => {
  const { service, post } = setup();
  const comment = service.comment(post.id, 'Original');
  comment.body = 'Changed outside the service';
  service.comments(post.id)[0].voteCount = 999;
  assert.equal(service.comments(post.id)[0].body, 'Original');
  assert.equal(service.comments(post.id)[0].voteCount, 0);
});
