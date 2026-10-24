import { AppError } from '../errors/app.error.js';
import {
  createCommentService,
  createReplyService,
  getCommentVoteService,
  getPostCommentsService,
  removeCommentService,
  updateCommentService,
  voteCommentService,
} from './comments.services.js';
import {
  COMMENTS_CONTRACTS,
  type CommentVoteRequest,
  type CommentVoteResponse,
  type CreateCommentRequest,
  type CreateCommentResponse,
  type CreateReplyRequest,
  type CreateReplyResponse,
  type GetAllForPostResponse,
  type RemoveCommentResponse,
  type UpdateCommentRequest,
  type UpdateCommentResponse,
} from '@summit/shared';
import type { Request, Response } from 'express';

type PostParams = {
  postId: string;
};

type CommentParams = {
  commentId: string;
};

function _parsePostId(params: PostParams): number {
  const parsed = COMMENTS_CONTRACTS.create.params.safeParse(params);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_ID', 'Invalid post ID.');
  }
  return parsed.data.postId;
}

function _parseCommentId(params: CommentParams): number {
  const parsed = COMMENTS_CONTRACTS.update.params.safeParse(params);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_ID', 'Invalid comment ID.');
  }
  return parsed.data.commentId;
}

function _requireUserId(request: Request): number {
  if (request.userId === undefined) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
  }
  return request.userId;
}

export async function createCommentController(
  request: Request<PostParams, unknown, CreateCommentRequest>,
  response: Response<CreateCommentResponse>,
): Promise<void> {
  const userId = _requireUserId(request);
  const postId = _parsePostId(request.params);
  const parsed = COMMENTS_CONTRACTS.create.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_REQUEST', 'Invalid comment data.');
  }
  const result = await createCommentService(postId, userId, parsed.data);
  const body = COMMENTS_CONTRACTS.create.responseBody.parse(result);
  response.status(201).json(body);
}

export async function createReplyController(
  request: Request<CommentParams, unknown, CreateReplyRequest>,
  response: Response<CreateReplyResponse>,
): Promise<void> {
  const userId = _requireUserId(request);
  const parentId = _parseCommentId(request.params);
  const parsed = COMMENTS_CONTRACTS.createReply.requestBody.safeParse(
    request.body,
  );
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_REQUEST', 'Invalid reply data.');
  }
  const result = await createReplyService(parentId, userId, parsed.data);
  const body = COMMENTS_CONTRACTS.createReply.responseBody.parse(result);
  response.status(201).json(body);
}

export async function getCommentVoteController(
  request: Request<CommentParams>,
  response: Response<CommentVoteResponse>,
): Promise<void> {
  const userId = _requireUserId(request);
  const commentId = _parseCommentId(request.params);
  const result = await getCommentVoteService(commentId, userId);
  const body = COMMENTS_CONTRACTS.getVote.responseBody.parse(result);
  response.status(200).json(body);
}

export async function getPostCommentsController(
  request: Request<PostParams>,
  response: Response<GetAllForPostResponse>,
): Promise<void> {
  const postId = _parsePostId(request.params);
  const result = await getPostCommentsService(postId);
  const body = COMMENTS_CONTRACTS.getAllForPost.responseBody.parse(result);
  response.status(200).json(body);
}

export async function removeCommentController(
  request: Request<CommentParams>,
  response: Response<RemoveCommentResponse>,
): Promise<void> {
  const userId = _requireUserId(request);
  const id = _parseCommentId(request.params);
  const result = await removeCommentService(id, userId);
  const body = COMMENTS_CONTRACTS.remove.responseBody.parse(result);
  response.status(200).json(body);
}

export async function updateCommentController(
  request: Request<CommentParams, unknown, UpdateCommentRequest>,
  response: Response<UpdateCommentResponse>,
): Promise<void> {
  const userId = _requireUserId(request);
  const id = _parseCommentId(request.params);
  const parsed = COMMENTS_CONTRACTS.update.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_REQUEST', 'Invalid update data.');
  }
  const result = await updateCommentService(id, userId, parsed.data);
  const body = COMMENTS_CONTRACTS.update.responseBody.parse(result);
  response.status(200).json(body);
}

export async function voteCommentController(
  request: Request<CommentParams, unknown, CommentVoteRequest>,
  response: Response<CommentVoteResponse>,
): Promise<void> {
  const userId = _requireUserId(request);
  const commentId = _parseCommentId(request.params);
  const parsed = COMMENTS_CONTRACTS.vote.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_REQUEST', 'Invalid vote value.');
  }
  const result = await voteCommentService(commentId, userId, parsed.data);
  const body = COMMENTS_CONTRACTS.vote.responseBody.parse(result);
  response.status(200).json(body);
}
