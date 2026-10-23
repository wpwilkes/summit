import { HTTP_METHOD } from '../common/http.js';
import { POSTS_PATHS } from './posts.paths.js';
import {
  CreatePostRequestSchema,
  CreatePostResponseSchema,
  GetAllPostsRequestSchema,
  GetAllPostsResponseSchema,
  GetByIdPostRequestSchema,
  GetByIdPostResponseSchema,
  GetVoteRequestSchema,
  PostIdParamsSchema,
  PostVoteRequestSchema,
  PostVoteResponseSchema,
  RemovePostRequestSchema,
  RemovePostResponseSchema,
  UpdatePostRequestSchema,
  UpdatePostResponseSchema,
} from './posts.schemas.js';

export const POSTS_CONTRACTS = {
  create: {
    method: HTTP_METHOD.post,
    path: POSTS_PATHS.create,
    requestBody: CreatePostRequestSchema,
    responseBody: CreatePostResponseSchema,
  },
  getAll: {
    method: HTTP_METHOD.get,
    path: POSTS_PATHS.getAll,
    requestBody: GetAllPostsRequestSchema,
    responseBody: GetAllPostsResponseSchema,
  },
  getById: {
    method: HTTP_METHOD.get,
    path: POSTS_PATHS.getById,
    params: PostIdParamsSchema,
    requestBody: GetByIdPostRequestSchema,
    responseBody: GetByIdPostResponseSchema,
  },
  getVote: {
    method: HTTP_METHOD.get,
    path: POSTS_PATHS.getVote,
    params: PostIdParamsSchema,
    requestBody: GetVoteRequestSchema,
    responseBody: PostVoteResponseSchema,
  },
  remove: {
    method: HTTP_METHOD.delete,
    path: POSTS_PATHS.remove,
    params: PostIdParamsSchema,
    requestBody: RemovePostRequestSchema,
    responseBody: RemovePostResponseSchema,
  },
  update: {
    method: HTTP_METHOD.patch,
    path: POSTS_PATHS.update,
    params: PostIdParamsSchema,
    requestBody: UpdatePostRequestSchema,
    responseBody: UpdatePostResponseSchema,
  },
  vote: {
    method: HTTP_METHOD.put,
    path: POSTS_PATHS.vote,
    params: PostIdParamsSchema,
    requestBody: PostVoteRequestSchema,
    responseBody: PostVoteResponseSchema,
  },
} as const;
