import { AppError } from '../errors/app.error.js';
import { ErrorCode } from '../errors/error-code.js';
import { HttpStatus } from '../errors/http-status.js';
import { ParamsBodyRequest, ParamsRequest } from '../types/requests.js';
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
  type CommentIdParams,
  type CommentPostIdParams,
  type CreateCommentRequest,
  type CreateCommentResponse,
  type CreateReplyRequest,
  type CreateReplyResponse,
  type GetAllForPostResponse,
  type RemoveCommentResponse,
  type UpdateCommentRequest,
  type UpdateCommentResponse,
} from '@summit/shared';
import type { Response } from 'express';

export async function createCommentController(
  request: ParamsBodyRequest<CommentPostIdParams, CreateCommentRequest>,
  response: Response<CreateCommentResponse>,
): Promise<void> {
  const parsedParams = COMMENTS_CONTRACTS.create.params.safeParse(
    request.params,
  );
  if (!parsedParams.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_POST_ID,
      'Invalid post ID.',
    );
  }
  const parsedBody = COMMENTS_CONTRACTS.create.requestBody.safeParse(
    request.body,
  );
  if (!parsedBody.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid comment data.',
    );
  }
  const result = await createCommentService(
    parsedParams.data.postId,
    request.userId!,
    parsedBody.data,
  );
  response.status(HttpStatus.CREATED).json(result);
}

export async function createReplyController(
  request: ParamsBodyRequest<CommentIdParams, CreateReplyRequest>,
  response: Response<CreateReplyResponse>,
): Promise<void> {
  const parsedParams = COMMENTS_CONTRACTS.createReply.params.safeParse(
    request.params,
  );
  if (!parsedParams.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_COMMENT_ID,
      'Invalid comment ID.',
    );
  }
  const parsedBody = COMMENTS_CONTRACTS.createReply.requestBody.safeParse(
    request.body,
  );
  if (!parsedBody.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid comment data.',
    );
  }
  const result = await createReplyService(
    parsedParams.data.commentId,
    request.userId!,
    parsedBody.data,
  );
  response.status(HttpStatus.CREATED).json(result);
}

export async function getCommentVoteController(
  request: ParamsRequest<CommentIdParams>,
  response: Response<CommentVoteResponse>,
): Promise<void> {
  const parsedParams = COMMENTS_CONTRACTS.getVote.params.safeParse(
    request.params,
  );
  if (!parsedParams.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_COMMENT_ID,
      'Invalid comment ID.',
    );
  }
  const result = await getCommentVoteService(
    parsedParams.data.commentId,
    request.userId!,
  );
  response.status(HttpStatus.OK).json(result);
}

export async function getPostCommentsController(
  request: ParamsRequest<CommentPostIdParams>,
  response: Response<GetAllForPostResponse>,
): Promise<void> {
  const parsedParams = COMMENTS_CONTRACTS.getAllForPost.params.safeParse(
    request.params,
  );
  if (!parsedParams.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_POST_ID,
      'Invalid post ID.',
    );
  }
  const result = await getPostCommentsService(parsedParams.data.postId);
  response.status(HttpStatus.OK).json(result);
}

export async function removeCommentController(
  request: ParamsRequest<CommentIdParams>,
  response: Response<RemoveCommentResponse>,
): Promise<void> {
  const parsedParams = COMMENTS_CONTRACTS.remove.params.safeParse(
    request.params,
  );
  if (!parsedParams.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_COMMENT_ID,
      'Invalid comment ID.',
    );
  }
  const result = await removeCommentService(
    parsedParams.data.commentId,
    request.userId!,
  );
  response.status(HttpStatus.OK).json(result);
}

export async function updateCommentController(
  request: ParamsBodyRequest<CommentIdParams, UpdateCommentRequest>,
  response: Response<UpdateCommentResponse>,
): Promise<void> {
  const parsedParams = COMMENTS_CONTRACTS.update.params.safeParse(
    request.params,
  );
  if (!parsedParams.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_COMMENT_ID,
      'Invalid comment ID.',
    );
  }
  const parsed = COMMENTS_CONTRACTS.update.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid update data.',
    );
  }
  const result = await updateCommentService(
    parsedParams.data.commentId,
    request.userId!,
    parsed.data,
  );
  response.status(HttpStatus.OK).json(result);
}

export async function voteCommentController(
  request: ParamsBodyRequest<CommentIdParams, CommentVoteRequest>,
  response: Response<CommentVoteResponse>,
): Promise<void> {
  const parsedParams = COMMENTS_CONTRACTS.vote.params.safeParse(request.params);
  if (!parsedParams.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_COMMENT_ID,
      'Invalid comment ID.',
    );
  }
  const parsed = COMMENTS_CONTRACTS.vote.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      'INVALID_REQUEST',
      'Invalid vote value.',
    );
  }
  const result = await voteCommentService(
    parsedParams.data.commentId,
    request.userId!,
    parsed.data,
  );
  response.status(HttpStatus.OK).json(result);
}
