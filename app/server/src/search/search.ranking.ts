// Never return more than this many results in one search.
export const MAX_RANKED_RESULTS = 50;

type RankablePost = { id: number; createdAt: Date };

// Put the most relevant posts first when searching with several terms.
// matchesPerTerm[i] holds the posts that matched terms[i]. The terms come in
// order of importance (the AI lists the main thing first), so an earlier term
// is worth more points. A post that matches several terms adds them all up.
// Posts with the same score are shown newest first.
export function rankByTermOrder<Post extends RankablePost>(
  matchesPerTerm: Post[][],
): Post[] {
  const termCount = matchesPerTerm.length;
  const scores = new Map<number, number>();
  const posts = new Map<number, Post>();

  matchesPerTerm.forEach((matches, index) => {
    const points = termCount - index;
    for (const post of matches) {
      scores.set(post.id, (scores.get(post.id) ?? 0) + points);
      posts.set(post.id, post);
    }
  });

  return [...posts.values()]
    .sort(
      (a, b) =>
        (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0) ||
        b.createdAt.getTime() - a.createdAt.getTime(),
    )
    .slice(0, MAX_RANKED_RESULTS);
}
