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
  getCommunityPostsService,
  getCommunityService,
  getJoinedCommunitiesService,
  joinCommunityService,
  leaveCommunityService,
  updateCommunityService,
} from './communities.services.js';

import {
  COMMUNITIES_CONTRACTS,
  type CommunityMembershipResponse,
  type CommunityNameParams,
  type CreateCommunityRequest,
  type CreateCommunityResponse,
  type GetAllCommunitiesResponse,
  type GetCommunityPostsResponse,
  type GetCommunityResponse,
  type GetJoinedCommunitiesResponse,
  type UpdateCommunityRequest,
  type UpdateCommunityResponse,
} from '@summit/shared';

import type { Request, Response } from 'express';

/*
 * CREATE COMMUNITY
 */
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

/*
 * GET ALL COMMUNITIES
 */
export async function getAllCommunitiesController(
  _request: Request,
  response: Response<GetAllCommunitiesResponse>,
): Promise<void> {
  const result = await getAllCommunitiesService();

  response.status(HttpStatus.OK).json(result);
}

/*
 * GET COMMUNITIES JOINED
 * BY THE CURRENT USER
 */
export async function getJoinedCommunitiesController(
  request: Request,
  response: Response<GetJoinedCommunitiesResponse>,
): Promise<void> {
  const result = await getJoinedCommunitiesService(request.userId!);

  response.status(HttpStatus.OK).json(result);
}

/*
 * GET ONE COMMUNITY
 */
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

/*
 * GET POSTS FOR ONE COMMUNITY
 */
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

/*
 * JOIN COMMUNITY
 */
export async function joinCommunityController(
  request: ParamsRequest<CommunityNameParams>,
  response: Response<CommunityMembershipResponse>,
): Promise<void> {
  const parsed = COMMUNITIES_CONTRACTS.join.params.safeParse(request.params);

  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid community name.',
    );
  }

  const result = await joinCommunityService(parsed.data.name, request.userId!);

  response.status(HttpStatus.OK).json(result);
}

/*
 * LEAVE COMMUNITY
 */
export async function leaveCommunityController(
  request: ParamsRequest<CommunityNameParams>,
  response: Response<CommunityMembershipResponse>,
): Promise<void> {
  const parsed = COMMUNITIES_CONTRACTS.leave.params.safeParse(request.params);

  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid community name.',
    );
  }

  const result = await leaveCommunityService(parsed.data.name, request.userId!);

  response.status(HttpStatus.OK).json(result);
}

/*
 * UPDATE COMMUNITY
 */
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
