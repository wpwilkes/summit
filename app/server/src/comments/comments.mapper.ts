import { createComment } from './comments.repositories.js';
import { Comment } from '@summit/shared';

export type DatabaseComment = Awaited<ReturnType<typeof createComment>>;

export function toCommentContract(
  comment: DatabaseComment,
  viewerId?: number,
): Comment {
  const deleted = comment.deletedAt !== null;
  return {
    id: comment.id,
    postId: comment.postId,
    ...(!comment.isAnonymous
      ? {
          authorId: comment.authorId,
          authorUsername: comment.author.username,
        }
      : {}),
    parentId: comment.parentId,
    body: deleted ? '[deleted]' : comment.body,
    votes: comment.vote,
    deleted,
    createdAt: comment.createdAt.toISOString(),
    isAnonymous: comment.isAnonymous,
    isOwner:
      viewerId !== undefined && viewerId === comment.authorId && !deleted,
  };
}
