import { searchPosts } from './search.repositories.js';
import type {
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
    authorId: post.authorId,
    authorUsername: post.author.username,
    votes: post.vote,
    commentCount: post._count.comments,
    createdAt: post.createdAt.toISOString(),
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
