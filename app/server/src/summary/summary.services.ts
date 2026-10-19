import type { SummarizeRequest } from '@summit/shared';

// The summary has to stay under this many words.
const MAX_SUMMARY_WORDS = 120;

// A sentence needs at least this many words to count as a key point.
const MIN_POINT_WORDS = 4;

// Everyday words that tell us nothing about the topic.
const STOP_WORDS = new Set([
  'about',
  'also',
  'because',
  'been',
  'could',
  'does',
  'from',
  'have',
  'just',
  'like',
  'more',
  'much',
  'really',
  'should',
  'some',
  'than',
  'that',
  'their',
  'then',
  'there',
  'they',
  'this',
  'very',
  'want',
  'were',
  'what',
  'when',
  'will',
  'with',
  'would',
  'your',
]);

// Keeps the first few words and adds "..." if we had to cut something.
function cutWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return words.join(' ');
  }
  return `${words.slice(0, maxWords).join(' ')}...`;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function getWords(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

function isUsefulWord(word: string): boolean {
  return word.length > 3 && !STOP_WORDS.has(word);
}

// How many times each useful word shows up across all the texts.
function countWords(texts: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const text of texts) {
    for (const word of getWords(text).filter(isUsefulWord)) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }
  return counts;
}

// A word only counts as a topic if people repeated it.
function findTopics(counts: Map<string, number>, limit: number): string[] {
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
}

// Picks the sentences that use the most common words, so they
// represent what most people were talking about.
function pickKeySentences(
  texts: string[],
  counts: Map<string, number>,
  limit: number,
): string[] {
  const seen = new Set<string>();
  const scored: { sentence: string; index: number; score: number }[] = [];

  texts.flatMap(splitSentences).forEach((sentence, index) => {
    const key = sentence.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    // one or two words like "Great news." don't make a useful point
    const words = getWords(sentence);
    if (words.length < MIN_POINT_WORDS) {
      return;
    }
    const total = words
      .filter(isUsefulWord)
      .reduce((sum, word) => sum + (counts.get(word) ?? 0), 0);
    scored.push({ sentence, index, score: total / Math.max(words.length, 1) });
  });

  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((item) => item.sentence);
}

// Plain code summary for now. The OpenRouter call will replace this later,
// so the controller only needs to know the input and the returned text.
export function summarizeService({
  title,
  description,
  comments = [],
}: SummarizeRequest): string {
  const parts: string[] = [];

  // Start with what the post is about.
  parts.push(`Post: "${cutWords(title, 15)}".`);
  const firstSentence = splitSentences(description)[0];
  if (firstSentence) {
    parts.push(cutWords(firstSentence, 25));
  }

  // Nobody has replied yet, so the post is all we can summarize.
  if (comments.length === 0) {
    parts.push('No comments yet.');
    return cutWords(parts.join(' '), MAX_SUMMARY_WORDS);
  }

  const counts = countWords(comments);
  const topics = findTopics(counts, 3);
  const keyPoints = pickKeySentences(comments, counts, 2).map(
    (sentence) => `"${cutWords(sentence, 20)}"`,
  );

  parts.push(
    `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'} so far.`,
  );
  if (topics.length > 0) {
    parts.push(`Common topics: ${topics.join(', ')}.`);
  }
  if (keyPoints.length > 0) {
    parts.push(`Key points: ${keyPoints.join(' ')}`);
  }

  // Last safety net so we never go over the limit.
  return cutWords(parts.join(' '), MAX_SUMMARY_WORDS);
}
