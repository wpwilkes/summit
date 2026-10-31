import { createComment } from './comments.repositories.js';
import { Comment } from '@summit/shared';

export type DatabaseComment = Awaited<ReturnType<typeof createComment>>;

export function toCommentContract(comment: DatabaseComment): Comment {
  const deleted = comment.deletedAt !== null;
  return {
    id: comment.id,
    postId: comment.postId,
    authorId: comment.authorId,
    parentId: comment.parentId,
    body: deleted ? '[deleted]' : comment.body,
    votes: comment.vote,
    deleted,
    createdAt: comment.createdAt.toISOString(),
  };
}
