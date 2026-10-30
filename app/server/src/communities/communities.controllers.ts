import { AppError } from '../errors/app.error.js';
import { ErrorCode } from '../errors/error-code.js';
import { HttpStatus } from '../errors/http-status.js';
import {
  BodyRequest,
  ParamsBodyRequest,
  ParamsRequest,
} from '../types/requests.js';
import {
  createCommunityService,
  getAllCommunitiesService,
  getCommunityService,
  getCommunityPostsService,
  updateCommunityService,
} from './communities.services.js';
import {
  COMMUNITIES_CONTRACTS,
  type CommunityNameParams,
  type CreateCommunityRequest,
  type CreateCommunityResponse,
  type GetAllCommunitiesResponse,
  type GetCommunityResponse,
  type GetCommunityPostsResponse,
  type UpdateCommunityRequest,
  type UpdateCommunityResponse,
} from '@summit/shared';
import type { Request, Response } from 'express';

export async function createCommunityController(
  request: BodyRequest<CreateCommunityRequest>,
  response: Response<CreateCommunityResponse>,
): Promise<void> {
  const parsed = COMMUNITIES_CONTRACTS.create.requestBody.safeParse(
    request.body,
  );
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid community data.',
    );
  }
  const result = await createCommunityService(parsed.data, request.userId!);
  response.status(HttpStatus.CREATED).json(result);
}

export async function getAllCommunitiesController(
  _request: Request,
  response: Response<GetAllCommunitiesResponse>,
): Promise<void> {
  const result = await getAllCommunitiesService();
  response.status(HttpStatus.OK).json(result);
}

export async function getCommunityController(
  request: ParamsRequest<CommunityNameParams>,
  response: Response<GetCommunityResponse>,
): Promise<void> {
  const parsed = COMMUNITIES_CONTRACTS.getByName.params.safeParse(
    request.params,
  );
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid community name.',
    );
  }
  const result = await getCommunityService(parsed.data.name);
  response.status(HttpStatus.OK).json(result);
}

export async function getCommunityPostsController(
  request: Request<CommunityNameParams>,
  response: Response<GetCommunityPostsResponse>,
): Promise<void> {
  const parsed = COMMUNITIES_CONTRACTS.getPosts.params.safeParse(
    request.params,
  );
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid community name.',
    );
  }
  const result = await getCommunityPostsService(parsed.data.name);
  response.status(HttpStatus.OK).json(result);
}

export async function updateCommunityController(
  request: ParamsBodyRequest<CommunityNameParams, UpdateCommunityRequest>,
  response: Response<UpdateCommunityResponse>,
): Promise<void> {
  const paramsParsed = COMMUNITIES_CONTRACTS.update.params.safeParse(
    request.params,
  );
  const bodyParsed = COMMUNITIES_CONTRACTS.update.requestBody.safeParse(
    request.body,
  );
  if (!paramsParsed.success || !bodyParsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid community update data.',
    );
  }
  const result = await updateCommunityService(
    paramsParsed.data.name,
    request.userId!,
    bodyParsed.data,
  );
  response.status(HttpStatus.OK).json(result);
}
