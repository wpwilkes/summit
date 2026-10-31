import { AppError } from '../errors/app.error.js';
import { ErrorCode } from '../errors/error-code.js';
import { HttpStatus } from '../errors/http-status.js';

import {
  DatabaseCommunity,
  toCommunityContract,
} from './communities.mappers.js';

import {
  createCommunity,
  getAllCommunities,
  getCommunityByName,
  getCommunityPosts,
  getJoinedCommunities,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
} from './communities.repositories.js';

import { toPostContract } from '../posts/posts.mapper.js';

import type {
  CommunityMembershipResponse,
  CreateCommunityRequest,
  CreateCommunityResponse,
  GetAllCommunitiesResponse,
  GetCommunityPostsResponse,
  GetCommunityResponse,
  GetJoinedCommunitiesResponse,
  UpdateCommunityRequest,
  UpdateCommunityResponse,
} from '@summit/shared';

async function requireExistingCommunity(
  name: string,
): Promise<DatabaseCommunity> {
  const community = await getCommunityByName(name);

  if (!community) {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.COMMUNITY_NOT_FOUND,
      'Community not found.',
    );
  }

  return community;
}

export async function createCommunityService(
  data: CreateCommunityRequest,
  userId: number,
): Promise<CreateCommunityResponse> {
  const existing = await getCommunityByName(data.name);

  if (existing) {
    throw new AppError(
      HttpStatus.CONFLICT,
      ErrorCode.COMMUNITY_ALREADY_EXISTS,
      'Community name already exists.',
    );
  }

  const community = await createCommunity(
    data.name,
    data.description,
    data.topic,
    data.subtopic,
    userId,
  );

  return {
    community: toCommunityContract(community),
  };
}

export async function getAllCommunitiesService(): Promise<GetAllCommunitiesResponse> {
  const communities = await getAllCommunities();

  return {
    communities: communities.map(toCommunityContract),
  };
}

export async function getCommunityService(
  name: string,
): Promise<GetCommunityResponse> {
  const community = await requireExistingCommunity(name);

  return {
    community: toCommunityContract(community),
  };
}

export async function getCommunityPostsService(
  name: string,
): Promise<GetCommunityPostsResponse> {
  const community = await requireExistingCommunity(name);

  const posts = await getCommunityPosts(community.id);

  return {
    posts: posts.map(toPostContract),
  };
}

export async function updateCommunityService(
  name: string,
  userId: number,
  data: UpdateCommunityRequest,
): Promise<UpdateCommunityResponse> {
  const existing = await requireExistingCommunity(name);

  if (existing.creatorId !== userId) {
    throw new AppError(
      HttpStatus.FORBIDDEN,
      ErrorCode.FORBIDDEN,
      "You cannot edit another user's community.",
    );
  }

  const community = await updateCommunity(existing.id, data.description);

  return {
    community: toCommunityContract(community),
  };
}

/*
 * JOIN COMMUNITY
 */
export async function joinCommunityService(
  name: string,
  userId: number,
): Promise<CommunityMembershipResponse> {
  const community = await requireExistingCommunity(name);

  await joinCommunity(userId, community.id);

  return {
    communityId: community.id,
    joined: true,
  };
}

/*
 * LEAVE COMMUNITY
 */
export async function leaveCommunityService(
  name: string,
  userId: number,
): Promise<CommunityMembershipResponse> {
  const community = await requireExistingCommunity(name);

  await leaveCommunity(userId, community.id);

  return {
    communityId: community.id,
    joined: false,
  };
}

/*
 * GET ALL COMMUNITIES JOINED
 * BY THE CURRENT USER
 */
export async function getJoinedCommunitiesService(
  userId: number,
): Promise<GetJoinedCommunitiesResponse> {
  const communities = await getJoinedCommunities(userId);

  return {
    communities: communities.map(toCommunityContract),
  };
}
