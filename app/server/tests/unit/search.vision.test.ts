import {
  buildImageKeywordMessages,
  MAX_KEYWORDS,
  parseKeywords,
  toSearchTerm,
  toSearchTerms,
} from '../../src/search/search.vision.js';
import assert from 'node:assert/strict';
import test from 'node:test';

test('parseKeywords cleans up the AI reply', () => {
  assert.deepEqual(parseKeywords('Hike, Mountain, trail.'), [
    'hike',
    'mountain',
    'trail',
  ]);
});

test('parseKeywords accepts one keyword per line or numbered lists', () => {
  assert.deepEqual(parseKeywords('1. Grand Canyon\n2. river\n- desert'), [
    'grand canyon',
    'river',
    'desert',
  ]);
});

test('parseKeywords drops repeats, very short words and NONE', () => {
  assert.deepEqual(parseKeywords('flag, Flag, a, of, none, Bangladesh'), [
    'flag',
    'bangladesh',
  ]);
  assert.deepEqual(parseKeywords('NONE'), []);
  assert.deepEqual(parseKeywords('  none  '), []);
});

test('parseKeywords keeps at most MAX_KEYWORDS words', () => {
  const reply = Array.from({ length: 10 }, (_, i) => `word${i}`).join(', ');
  assert.equal(parseKeywords(reply).length, MAX_KEYWORDS);
});

test('toSearchTerm turns common word endings into a base form', () => {
  assert.equal(toSearchTerm('hiking'), 'hik');
  assert.equal(toSearchTerm('mountains'), 'mountain');
  assert.equal(toSearchTerm('berries'), 'berry');
  assert.equal(toSearchTerm('hike'), 'hike');
  // Words that only look plural stay as they are.
  assert.equal(toSearchTerm('glass'), 'glass');
  assert.equal(toSearchTerm('cactus'), 'cactus');
  assert.equal(toSearchTerm('news'), 'news');
});

test('toSearchTerms removes repeats after shortening', () => {
  assert.deepEqual(toSearchTerms(['mountain', 'mountains', 'hiking']), [
    'mountain',
    'hik',
  ]);
});

test('buildImageKeywordMessages sends the picture as a data URL', () => {
  const image = Buffer.from([1, 2, 3]);
  const messages = buildImageKeywordMessages(image, 'image/jpeg');

  assert.equal(messages[0].role, 'system');
  assert.match(String(messages[0].content), /keywords/);
  const parts = messages[1].content;
  assert.ok(Array.isArray(parts));
  assert.deepEqual(parts[1], {
    type: 'image_url',
    image_url: { url: 'data:image/jpeg;base64,AQID' },
  });
});
