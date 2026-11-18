import {
  MAX_RANKED_RESULTS,
  rankByTermOrder,
} from '../../src/search/search.ranking.js';
import assert from 'node:assert/strict';
import test from 'node:test';

function _post(id: number, day: number) {
  return { id, createdAt: new Date(Date.UTC(2026, 10, day)) };
}

test('rankByTermOrder puts posts matching the most important term first', () => {
  const bangladesh = _post(1, 1);
  const usa = _post(2, 5);
  // terms: ["bangladesh", "country"]; only the first post mentions Bangladesh,
  // both mention "country".
  const ranked = rankByTermOrder([[bangladesh], [usa, bangladesh]]);

  assert.deepEqual(
    ranked.map((post) => post.id),
    [1, 2],
  );
});

test('rankByTermOrder adds up points for posts that match several terms', () => {
  const both = _post(1, 1);
  const firstOnly = _post(2, 2);
  // terms: ["a", "b", "c"]: both = 3 + 2 = 5 points, firstOnly = 3 points.
  const ranked = rankByTermOrder([[firstOnly, both], [both], []]);

  assert.deepEqual(
    ranked.map((post) => post.id),
    [1, 2],
  );
});

test('rankByTermOrder shows newer posts first when scores are equal', () => {
  const older = _post(1, 1);
  const newer = _post(2, 9);

  const ranked = rankByTermOrder([[older, newer]]);

  assert.deepEqual(
    ranked.map((post) => post.id),
    [2, 1],
  );
});

test('rankByTermOrder lists each post once and caps the results', () => {
  const many = Array.from({ length: MAX_RANKED_RESULTS + 10 }, (_, i) =>
    _post(i + 1, 1),
  );

  const ranked = rankByTermOrder([many, many]);

  assert.equal(ranked.length, MAX_RANKED_RESULTS);
  assert.equal(new Set(ranked.map((post) => post.id)).size, ranked.length);
  assert.deepEqual(rankByTermOrder([]), []);
});
