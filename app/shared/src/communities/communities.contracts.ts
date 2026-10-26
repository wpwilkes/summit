import { HTTP_METHOD } from '../common/http.js';
import { COMMUNITIES_PATHS } from './communities.paths.js';
import {
  CommunityNameParamsSchema,
  CreateCommunityRequestSchema,
  CreateCommunityResponseSchema,
  GetAllCommunitiesResponseSchema,
  GetCommunityResponseSchema,
  GetCommunityPostsResponseSchema,
  UpdateCommunityRequestSchema,
  UpdateCommunityResponseSchema,
} from './communities.schemas.js';

export const COMMUNITIES_CONTRACTS = {
  create: {
    method: HTTP_METHOD.post,
    path: COMMUNITIES_PATHS.create,
    requestBody: CreateCommunityRequestSchema,
    responseBody: CreateCommunityResponseSchema,
  },
  getAll: {
    method: HTTP_METHOD.get,
    path: COMMUNITIES_PATHS.getAll,
    responseBody: GetAllCommunitiesResponseSchema,
  },
  getByName: {
    method: HTTP_METHOD.get,
    path: COMMUNITIES_PATHS.getByName,
    params: CommunityNameParamsSchema,
    responseBody: GetCommunityResponseSchema,
  },
  getPosts: {
    method: HTTP_METHOD.get,
    path: COMMUNITIES_PATHS.getPosts,
    params: CommunityNameParamsSchema,
    responseBody: GetCommunityPostsResponseSchema,
  },
  update: {
    method: HTTP_METHOD.patch,
    path: COMMUNITIES_PATHS.update,
    params: CommunityNameParamsSchema,
    requestBody: UpdateCommunityRequestSchema,
    responseBody: UpdateCommunityResponseSchema,
  },
} as const;
