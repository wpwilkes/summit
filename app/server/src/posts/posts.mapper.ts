import type { Post } from '@summit/shared';

type DatabasePost = {
  id: number;
  communityId: number;
  authorId: number;
  title: string;
  body: string;
  vote: number;
  createdAt: Date;
};

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
