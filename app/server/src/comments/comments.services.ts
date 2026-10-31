import { AppError } from '../errors/app.error.js';
import { HttpStatus } from '../errors/http-status.js';
import { ErrorCode } from '../errors/error-code.js';
import { DatabaseComment, toCommentContract } from './comments.mapper.js';
import {
  createComment,
  getByIdPost,
  getCommentsByPostId,
  getCommentById,
  getCommentVote,
  removeCommentById,
  setCommentVote,
  updateCommentById,
} from './comments.repositories.js';
import type {
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

async function requireExistingPost(postId: number): Promise<void> {
  const post = await getByIdPost(postId);
  if (!post) {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.POST_NOT_FOUND,
      'Post not found.',
    );
  }
}

async function requireExistingComment(
  commentId: number,
): Promise<DatabaseComment> {
  const comment = await getCommentById(commentId);
  if (!comment) {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.COMMENT_NOT_FOUND,
      'Comment not found.',
    );
  }
  return comment;
}

async function requireEditableComment(
  comentId: number,
  userId: number,
): Promise<DatabaseComment> {
  const comment = await requireExistingComment(comentId);
  if (comment.authorId !== userId) {
    throw new AppError(
      HttpStatus.FORBIDDEN,
      ErrorCode.FORBIDDEN,
      "You cannot modify another user's comment.",
    );
  }
  if (comment.deletedAt !== null) {
    throw new AppError(
      HttpStatus.CONFLICT,
      ErrorCode.COMMENT_DELETED,
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
  await requireExistingPost(postId);
  const comment = await createComment(postId, userId, data.body);
  return {
    comment: toCommentContract(comment),
  };
}

export async function createReplyService(
  parentId: number,
  userId: number,
  data: CreateReplyRequest,
): Promise<CreateReplyResponse> {
  const parent = await requireExistingComment(parentId);
  const reply = await createComment(
    parent.postId,
    userId,
    data.body,
    parent.id,
  );
  return {
    comment: toCommentContract(reply),
  };
}

export async function getCommentVoteService(
  commentId: number,
  userId: number,
): Promise<CommentVoteResponse> {
  const result = await getCommentVote(commentId, userId);
  if (!result) {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.COMMENT_NOT_FOUND,
      'Comment not found.',
    );
  }
  return result;
}

export async function getPostCommentsService(
  postId: number,
): Promise<GetAllForPostResponse> {
  await requireExistingPost(postId);
  const comments = await getCommentsByPostId(postId);
  return {
    comments: comments.map(toCommentContract),
  };
}

export async function removeCommentService(
  commentId: number,
  userId: number,
): Promise<RemoveCommentResponse> {
  await requireEditableComment(commentId, userId);
  await removeCommentById(commentId);
  return { success: true };
}

export async function updateCommentService(
  commentId: number,
  userId: number,
  data: UpdateCommentRequest,
): Promise<UpdateCommentResponse> {
  await requireEditableComment(commentId, userId);
  const comment = await updateCommentById(commentId, data.body);
  return {
    comment: toCommentContract(comment),
  };
}

export async function voteCommentService(
  commentId: number,
  userId: number,
  data: CommentVoteRequest,
): Promise<CommentVoteResponse> {
  const result = await setCommentVote(commentId, userId, data.value);
  if (result.status === 'not_found') {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.COMMENT_NOT_FOUND,
      'Comment not found.',
    );
  }
  if (result.status === 'deleted') {
    throw new AppError(
      HttpStatus.CONFLICT,
      ErrorCode.COMMENT_DELETED,
      'You cannot vote on a deleted comment.',
    );
  }
  return {
    votes: result.votes,
    userVote: result.userVote,
  };
}
