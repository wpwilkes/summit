import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Run the actual TypeScript service using the app's existing TypeScript package.
// No additional testing framework or backend is needed.
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

test('create a comment: attaches it to its post and rejects an empty comment', () => {
  const service = createSummitPostsService('Test user');
  const post = service.create({
    title: 'A Summit discussion',
    description: 'Share your thoughts here.',
    category: 'Education',
    anonymous: false,
  });

  const comment = service.comment(post.id, '  This is a useful discussion.  ');

  assert.ok(comment.id);
  assert.equal(comment.postId, post.id);
  assert.equal(comment.body, 'This is a useful discussion.');
  assert.equal(comment.author, 'Test user');
  assert.deepEqual(service.comments(post.id), [comment]);
  assert.equal(service.get(post.id).commentCount, 1);
  assert.throws(() => service.comment(post.id, ' '), /Comment is required/);
  assert.equal(service.comments(post.id).length, 1);
});
