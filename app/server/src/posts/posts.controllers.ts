import { AppError } from '../errors/app.error.js';
import { ErrorCode } from '../errors/error-code.js';
import { HttpStatus } from '../errors/http-status.js';
import type {
  BodyRequest,
  ParamsBodyRequest,
  ParamsRequest,
} from '../types/requests.js';
import {
  createPostService,
  getAllPostsService,
  getByIdPostService,
  getPostVoteService,
  removePostService,
  updatePostService,
  votePostService,
} from './posts.service.js';
import {
  POSTS_CONTRACTS,
  type PostIdParams,
  type CreatePostRequest,
  type CreatePostResponse,
  type GetAllPostsResponse,
  type GetByIdPostResponse,
  type PostVoteRequest,
  type PostVoteResponse,
  type RemovePostResponse,
  type UpdatePostRequest,
  type UpdatePostResponse,
} from '@summit/shared';
import type { Request, Response } from 'express';

export async function createPostController(
  request: BodyRequest<CreatePostRequest>,
  response: Response<CreatePostResponse>,
): Promise<void> {
  const parsed = POSTS_CONTRACTS.create.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid post data.',
    );
  }
  const result = await createPostService(parsed.data, request.userId!);
  response.status(HttpStatus.CREATED).json(result);
}

export async function getAllPostsController(
  _request: Request,
  response: Response<GetAllPostsResponse>,
): Promise<void> {
  const result = await getAllPostsService();
  response.status(HttpStatus.OK).json(result);
}

export async function getByIdPostController(
  request: ParamsRequest<PostIdParams>,
  response: Response<GetByIdPostResponse>,
): Promise<void> {
  const parsed = POSTS_CONTRACTS.getById.params.safeParse(request.params);
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_POST_ID,
      'Invalid post ID.',
    );
  }
  const result = await getByIdPostService(parsed.data.postId);
  response.status(HttpStatus.OK).json(result);
}

export async function getPostVoteController(
  request: ParamsRequest<PostIdParams>,
  response: Response<PostVoteResponse>,
): Promise<void> {
  const parsed = POSTS_CONTRACTS.getVote.params.safeParse(request.params);
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_POST_ID,
      'Invalid post ID.',
    );
  }
  const result = await getPostVoteService(parsed.data.postId, request.userId!);
  response.status(HttpStatus.OK).json(result);
}

export async function removePostController(
  request: ParamsRequest<PostIdParams>,
  response: Response<RemovePostResponse>,
): Promise<void> {
  const parsed = POSTS_CONTRACTS.remove.params.safeParse(request.params);
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_POST_ID,
      'Invalid post ID.',
    );
  }
  const result = await removePostService(parsed.data.postId, request.userId!);
  response.status(HttpStatus.OK).json(result);
}

export async function updatePostController(
  request: ParamsBodyRequest<PostIdParams, UpdatePostRequest>,
  response: Response<UpdatePostResponse>,
): Promise<void> {
  const parsedParams = POSTS_CONTRACTS.update.params.safeParse(request.params);
  if (!parsedParams.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_POST_ID,
      'Invalid post ID.',
    );
  }
  const parsedBody = POSTS_CONTRACTS.update.requestBody.safeParse(request.body);
  if (!parsedBody.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid update data.',
    );
  }
  const result = await updatePostService(
    parsedParams.data.postId,
    request.userId!,
    parsedBody.data,
  );
  response.status(HttpStatus.OK).json(result);
}

export async function votePostController(
  request: ParamsBodyRequest<PostIdParams, PostVoteRequest>,
  response: Response<PostVoteResponse>,
): Promise<void> {
  const parsedParams = POSTS_CONTRACTS.vote.params.safeParse(request.params);
  if (!parsedParams.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_POST_ID,
      'Invalid post ID.',
    );
  }
  const parsedBody = POSTS_CONTRACTS.vote.requestBody.safeParse(request.body);
  if (!parsedBody.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid update data.',
    );
  }
  const result = await votePostService(
    parsedParams.data.postId,
    request.userId!,
    parsedBody.data,
  );
  response.status(HttpStatus.OK).json(result);
}
