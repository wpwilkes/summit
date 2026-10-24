import { AppError } from '../errors/app.error.js';
import type {
  BodyRequest,
  ParamsRequest,
  ParamsBodyRequest,
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
  type CreatePostRequest,
  type CreatePostResponse,
  type GetAllPostsRequest,
  type GetAllPostsResponse,
  type GetByIdPostResponse,
  type RemovePostResponse,
  type PostVoteRequest,
  type UpdatePostRequest,
  type UpdatePostResponse,
  type PostVoteResponse,
} from '@summit/shared';
import type { Request, Response } from 'express';

type PostParams = {
  postId: string;
};

type PostVoteParams = {
  postId: string;
};

function _parsePostId(request: Request<PostParams>): number {
  const parsed = POSTS_CONTRACTS.getById.params.safeParse(request.params);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_ID', 'Invalid post ID.');
  }
  return parsed.data.postId;
}

function _parseVotePostId(request: Request<PostVoteParams>): number {
  const parsed = POSTS_CONTRACTS.vote.params.safeParse(request.params);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_ID', 'Invalid post ID.');
  }
  return parsed.data.postId;
}

export async function createPostController(
  request: BodyRequest<CreatePostRequest>,
  response: Response<CreatePostResponse>,
): Promise<void> {
  if (request.userId === undefined) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
  }
  const parsed = POSTS_CONTRACTS.create.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_REQUEST', 'Invalid post data.');
  }
  const result = await createPostService(parsed.data, request.userId);
  const body = POSTS_CONTRACTS.create.responseBody.parse(result);
  response.status(201).json(body);
}

export async function getAllPostsController(
  _request: Request<GetAllPostsRequest>,
  response: Response<GetAllPostsResponse>,
): Promise<void> {
  const result = await getAllPostsService();
  const body = POSTS_CONTRACTS.getAll.responseBody.parse(result);
  response.status(200).json(body);
}

export async function getByIdPostController(
  request: ParamsRequest<PostParams>,
  response: Response<GetByIdPostResponse>,
): Promise<void> {
  const id = _parsePostId(request);
  const result = await getByIdPostService(id);
  const body = POSTS_CONTRACTS.getById.responseBody.parse(result);
  response.status(200).json(body);
}

export async function getPostVoteController(
  request: Request<PostVoteParams>,
  response: Response<PostVoteResponse>,
): Promise<void> {
  if (request.userId === undefined) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
  }
  const postId = _parseVotePostId(request);
  const result = await getPostVoteService(postId, request.userId);
  const body = POSTS_CONTRACTS.getVote.responseBody.parse(result);
  response.status(200).json(body);
}

export async function removePostController(
  request: ParamsRequest<PostParams>,
  response: Response<RemovePostResponse>,
): Promise<void> {
  if (request.userId === undefined) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
  }
  const id = _parsePostId(request);
  const result = await removePostService(id, request.userId);
  const body = POSTS_CONTRACTS.remove.responseBody.parse(result);
  response.status(200).json(body);
}

export async function updatePostController(
  request: ParamsBodyRequest<PostParams, UpdatePostRequest>,
  response: Response<UpdatePostResponse>,
): Promise<void> {
  if (request.userId === undefined) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
  }
  const id = _parsePostId(request);
  const parsed = POSTS_CONTRACTS.update.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_REQUEST', 'Invalid update data.');
  }
  const result = await updatePostService(id, request.userId, parsed.data);
  const body = POSTS_CONTRACTS.update.responseBody.parse(result);
  response.status(200).json(body);
}

export async function votePostController(
  request: Request<PostVoteParams, unknown, PostVoteRequest>,
  response: Response<PostVoteResponse>,
): Promise<void> {
  if (request.userId === undefined) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
  }
  const postId = _parseVotePostId(request);
  const parsed = POSTS_CONTRACTS.vote.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_REQUEST', 'Invalid vote value.');
  }
  const result = await votePostService(postId, request.userId, parsed.data);
  const body = POSTS_CONTRACTS.vote.responseBody.parse(result);
  response.status(200).json(body);
}
