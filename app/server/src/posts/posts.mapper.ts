import { getByIdPost } from './posts.repositories.js';
import type { Post } from '@summit/shared';

export type DatabasePost = NonNullable<Awaited<ReturnType<typeof getByIdPost>>>;

export function toPostContract(post: DatabasePost): Post {
  return {
    id: post.id,
    communityId: post.communityId,
    authorId: post.authorId,
    title: post.title,
    body: post.body,
    votes: post.vote,
    createdAt: post.createdAt.toISOString(),
  };
}
