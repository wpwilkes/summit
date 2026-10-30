import type { Post } from '@summit/shared';

type DatabasePost = {
  id: number;
  communityId: number;
  authorId: number;
  title: string;
  body: string;
  vote: number;
  createdAt: Date;
  photoUrl?: string | null;
  photoWidth?: number | null;
  photoHeight?: number | null;
  author?: { username: string };
  community?: { name: string };
  _count?: { comments: number };
};

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
