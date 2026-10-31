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
    ...(post.photoUrl ? { photoUrl: post.photoUrl } : {}),
    ...(post.photoWidth ? { photoWidth: post.photoWidth } : {}),
    ...(post.photoHeight ? { photoHeight: post.photoHeight } : {}),
    ...(post.author ? { authorUsername: post.author.username } : {}),
    ...(post.community ? { communityName: post.community.name } : {}),
    ...(post._count ? { commentCount: post._count.comments } : {}),
    votes: post.vote,
    createdAt: post.createdAt.toISOString(),
  };
}
