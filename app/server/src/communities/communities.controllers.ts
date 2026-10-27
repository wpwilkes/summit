import { AppError } from '../errors/app.error.js';
import {
  createCommunityService,
  getAllCommunitiesService,
  getCommunityService,
  getCommunityPostsService,
  updateCommunityService,
} from './communities.services.js';
import {
  COMMUNITIES_CONTRACTS,
  type CreateCommunityRequest,
  type CreateCommunityResponse,
  type GetAllCommunitiesResponse,
  type GetCommunityResponse,
  type GetCommunityPostsResponse,
  type UpdateCommunityRequest,
  type UpdateCommunityResponse,
} from '@summit/shared';
import type { Request, Response } from 'express';

type CommunityParams = {
  name: string;
};

function parseCommunityName(params: CommunityParams): string {
  const parsed = COMMUNITIES_CONTRACTS.getByName.params.safeParse(params);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_NAME', 'Invalid community name.');
  }

  return parsed.data.name;
}

function requireUserId(request: { userId?: number }): number {
  if (request.userId === undefined) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
  }
  return request.userId;
}

export async function createCommunityController(
  request: Request<Record<string, never>, unknown, CreateCommunityRequest>,
  response: Response<CreateCommunityResponse>,
): Promise<void> {
  const userId = requireUserId(request);
  const parsed = COMMUNITIES_CONTRACTS.create.requestBody.safeParse(
    request.body,
  );
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_REQUEST', 'Invalid community data.');
  }
  const result = await createCommunityService(parsed.data, userId);
  const body = COMMUNITIES_CONTRACTS.create.responseBody.parse(result);
  response.status(201).json(body);
}

export async function getAllCommunitiesController(
  _request: Request,
  response: Response<GetAllCommunitiesResponse>,
): Promise<void> {
  const result = await getAllCommunitiesService();
  const body = COMMUNITIES_CONTRACTS.getAll.responseBody.parse(result);
  response.status(200).json(body);
}

export async function getCommunityController(
  request: Request<CommunityParams>,
  response: Response<GetCommunityResponse>,
): Promise<void> {
  const name = parseCommunityName(request.params);
  const result = await getCommunityService(name);
  const body = COMMUNITIES_CONTRACTS.getByName.responseBody.parse(result);
  response.status(200).json(body);
}

export async function updateCommunityController(
  request: Request<CommunityParams, unknown, UpdateCommunityRequest>,
  response: Response<UpdateCommunityResponse>,
): Promise<void> {
  const userId = requireUserId(request);
  const name = parseCommunityName(request.params);
  const parsed = COMMUNITIES_CONTRACTS.update.requestBody.safeParse(
    request.body,
  );
  if (!parsed.success) {
    throw new AppError(
      400,
      'INVALID_REQUEST',
      'Invalid community update data.',
    );
  }
  const result = await updateCommunityService(name, userId, parsed.data);
  const body = COMMUNITIES_CONTRACTS.update.responseBody.parse(result);
  response.status(200).json(body);
}

export async function getCommunityPostsController(
  request: Request<CommunityParams>,
  response: Response<GetCommunityPostsResponse>,
): Promise<void> {
  const name = parseCommunityName(request.params);
  const result = await getCommunityPostsService(name);
  const body = COMMUNITIES_CONTRACTS.getPosts.responseBody.parse(result);
  response.status(200).json(body);
}
