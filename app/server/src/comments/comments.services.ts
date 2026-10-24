import { AppError } from '../errors/app.error.js';
import { getByIdPost } from '../posts/posts.repositories.js';
import {
  createComment,
  getCommentsByPostId,
  getCommentById,
  getCommentVote,
  removeCommentById,
  setCommentVote,
  updateCommentById,
} from './comments.repositories.js';
import type {
  Comment,
  CreateCommentRequest,
  CreateCommentResponse,
  CreateReplyRequest,
  CreateReplyResponse,
  GetAllForPostResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
  RemoveCommentResponse,
  CommentVoteRequest,
  CommentVoteResponse,
} from '@summit/shared';

type DatabaseComment = Awaited<ReturnType<typeof createComment>>;

function _toCommentContract(comment: DatabaseComment): Comment {
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

async function _requireExistingPost(postId: number): Promise<void> {
  const post = await getByIdPost(postId);
  if (!post) {
    throw new AppError(404, 'POST_NOT_FOUND', 'Post not found.');
  }
}

async function _requireExistingComment(id: number): Promise<DatabaseComment> {
  const comment = await getCommentById(id);
  if (!comment) {
    throw new AppError(404, 'COMMENT_NOT_FOUND', 'Comment not found.');
  }
  return comment;
}

async function _requireEditableComment(
  id: number,
  userId: number,
): Promise<DatabaseComment> {
  const comment = await _requireExistingComment(id);
  if (comment.authorId !== userId) {
    throw new AppError(
      403,
      'FORBIDDEN',
      "You cannot modify another user's comment.",
    );
  }
  if (comment.deletedAt !== null) {
    throw new AppError(
      409,
      'COMMENT_DELETED',
      'This comment has already been deleted.',
    );
  }
  return comment;
}

export async function createCommentService(
  postId: number,
  userId: number,
  data: CreateCommentRequest,
): Promise<CreateCommentResponse> {
  await _requireExistingPost(postId);
  const comment = await createComment(postId, userId, data.body);
  return {
    comment: _toCommentContract(comment),
  };
}

export async function createReplyService(
  parentId: number,
  userId: number,
  data: CreateReplyRequest,
): Promise<CreateReplyResponse> {
  const parent = await _requireExistingComment(parentId);
  const reply = await createComment(
    parent.postId,
    userId,
    data.body,
    parent.id,
  );
  return {
    comment: _toCommentContract(reply),
  };
}

export async function getCommentVoteService(
  commentId: number,
  userId: number,
): Promise<CommentVoteResponse> {
  const result = await getCommentVote(commentId, userId);
  if (!result) {
    throw new AppError(404, 'COMMENT_NOT_FOUND', 'Comment not found.');
  }
  return result;
}

export async function getPostCommentsService(
  postId: number,
): Promise<GetAllForPostResponse> {
  await _requireExistingPost(postId);
  const comments = await getCommentsByPostId(postId);
  return {
    comments: comments.map(_toCommentContract),
  };
}

export async function removeCommentService(
  id: number,
  userId: number,
): Promise<RemoveCommentResponse> {
  await _requireEditableComment(id, userId);
  await removeCommentById(id);
  return { success: true };
}

export async function updateCommentService(
  id: number,
  userId: number,
  data: UpdateCommentRequest,
): Promise<UpdateCommentResponse> {
  await _requireEditableComment(id, userId);
  const comment = await updateCommentById(id, data.body);
  return {
    comment: _toCommentContract(comment),
  };
}

export async function voteCommentService(
  commentId: number,
  userId: number,
  data: CommentVoteRequest,
): Promise<CommentVoteResponse> {
  const result = await setCommentVote(commentId, userId, data.value);
  if (result.status === 'not_found') {
    throw new AppError(404, 'COMMENT_NOT_FOUND', 'Comment not found.');
  }
  if (result.status === 'deleted') {
    throw new AppError(
      409,
      'COMMENT_DELETED',
      'You cannot vote on a deleted comment.',
    );
  }
  return {
    votes: result.votes,
    userVote: result.userVote,
  };
}
