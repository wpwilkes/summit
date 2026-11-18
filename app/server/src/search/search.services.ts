import { rankByTermOrder } from './search.ranking.js';
import { searchPosts, searchPostsAndComments } from './search.repositories.js';
import { describeImage, toSearchTerms } from './search.vision.js';
import type {
  SearchByImageResponse,
  SearchPostResult,
  SearchPostsResponse,
} from '@summit/shared';

type DatabaseSearchPost = Awaited<ReturnType<typeof searchPosts>>[number];

// Turn a database row into the shape the API promises to send back.
function toSearchPostResult(post: DatabaseSearchPost): SearchPostResult {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    votes: post.vote,
    commentCount: post._count.comments,
    createdAt: post.createdAt.toISOString(),
    isAnonymous: post.isAnonymous,
    ...(!post.isAnonymous
      ? {
          authorId: post.authorId,
          authorUsername: post.author.username,
        }
      : {}),
  };
}

export async function searchPostsService(
  keyword: string,
): Promise<SearchPostsResponse> {
  const posts = await searchPosts(keyword);
  return {
    query: keyword,
    posts: posts.map(toSearchPostResult),
  };
}

// Search by image: the AI says what the picture shows, then we look for posts
// whose title, text or comments mention any of those words. Posts that match
// the most important words come first.
export async function searchByImageService(
  image: Buffer,
  mimeType: string,
): Promise<SearchByImageResponse> {
  const keywords = await describeImage(image, mimeType);
  const terms = toSearchTerms(keywords);
  const matchesPerTerm = await Promise.all(
    terms.map((term) => searchPostsAndComments(term)),
  );
  return {
    keywords,
    posts: rankByTermOrder(matchesPerTerm).map(toSearchPostResult),
  };
}
