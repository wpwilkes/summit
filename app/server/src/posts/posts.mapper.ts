import { getByIdPost } from './posts.repositories.js';
import type { Post } from '@summit/shared';

export type DatabasePost = NonNullable<Awaited<ReturnType<typeof getByIdPost>>>;

export function toPostContract(post: DatabasePost, viewerId?: number): Post {
  return {
    id: post.id,
    communityId: post.communityId,
    isAnonymous: post.isAnonymous,
    isOwner: viewerId !== undefined && viewerId === post.authorId,
    ...(!post.isAnonymous
      ? {
          authorId: post.authorId,
          authorUsername: post.author.username,
        }
      : {}),
    title: post.title,
    body: post.body,
    ...(post.photoUrl ? { photoUrl: post.photoUrl } : {}),
    ...(post.photoWidth ? { photoWidth: post.photoWidth } : {}),
    ...(post.photoHeight ? { photoHeight: post.photoHeight } : {}),
    ...(post.community ? { communityName: post.community.name } : {}),
    ...(post._count ? { commentCount: post._count.comments } : {}),
    votes: post.vote,
    createdAt: post.createdAt.toISOString(),
  };
}
