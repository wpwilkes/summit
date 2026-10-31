import { HTTP_METHOD } from '../common/http.js';

import { COMMUNITIES_PATHS } from './communities.paths.js';

import {
  CommunityMembershipResponseSchema,
  CommunityNameParamsSchema,
  CreateCommunityRequestSchema,
  CreateCommunityResponseSchema,
  GetAllCommunitiesResponseSchema,
  GetCommunityPostsResponseSchema,
  GetCommunityResponseSchema,
  GetJoinedCommunitiesResponseSchema,
  UpdateCommunityRequestSchema,
  UpdateCommunityResponseSchema,
} from './communities.schemas.js';

export const COMMUNITIES_CONTRACTS = {
  create: {
    method: HTTP_METHOD.post,
    path: COMMUNITIES_PATHS.create,
    requestBody:
      CreateCommunityRequestSchema,
    responseBody:
      CreateCommunityResponseSchema,
  },

  getAll: {
    method: HTTP_METHOD.get,
    path: COMMUNITIES_PATHS.getAll,
    responseBody:
      GetAllCommunitiesResponseSchema,
  },

  getJoined: {
    method: HTTP_METHOD.get,
    path: COMMUNITIES_PATHS.getJoined,
    responseBody:
      GetJoinedCommunitiesResponseSchema,
  },

  getByName: {
    method: HTTP_METHOD.get,
    path: COMMUNITIES_PATHS.getByName,
    params:
      CommunityNameParamsSchema,
    responseBody:
      GetCommunityResponseSchema,
  },

  getPosts: {
    method: HTTP_METHOD.get,
    path: COMMUNITIES_PATHS.getPosts,
    params:
      CommunityNameParamsSchema,
    responseBody:
      GetCommunityPostsResponseSchema,
  },

  join: {
    method: HTTP_METHOD.post,
    path: COMMUNITIES_PATHS.join,
    params:
      CommunityNameParamsSchema,
    responseBody:
      CommunityMembershipResponseSchema,
  },

  leave: {
    method: HTTP_METHOD.delete,
    path: COMMUNITIES_PATHS.leave,
    params:
      CommunityNameParamsSchema,
    responseBody:
      CommunityMembershipResponseSchema,
  },

  update: {
    method: HTTP_METHOD.patch,
    path: COMMUNITIES_PATHS.update,
    params:
      CommunityNameParamsSchema,
    requestBody:
      UpdateCommunityRequestSchema,
    responseBody:
      UpdateCommunityResponseSchema,
  },
} as const;
