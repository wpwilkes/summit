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

test('create a post: stores valid input and rejects an empty title', () => {
  const service = createSummitPostsService('Test user');
  const input = {
    title: '  My first Summit post  ',
    description: 'A discussion about React Native.',
    category: 'Technology',
    anonymous: false,
  };

  const created = service.create(input);

  assert.ok(created.id);
  assert.equal(created.title, 'My first Summit post');
  assert.equal(created.description, input.description);
  assert.equal(created.category, 'Technology');
  assert.equal(created.author, 'Test user');
  assert.equal(created.voteCount, 0);
  assert.equal(created.commentCount, 0);
  assert.deepEqual(service.list('Technology'), [created]);
  assert.throws(() => service.create({ ...input, title: ' ' }), /Title is required/);
  assert.equal(service.list().length, 1);
});
