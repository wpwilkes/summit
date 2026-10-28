import { AppError } from '../errors/app.error.js';
import {
  createCommunity,
  getAllCommunities,
  getCommunityByName,
  getCommunityPosts,
  updateCommunity,
} from './communities.repositories.js';
import { toPostContract } from '../posts/posts.mapper.js';
import type {
  Community,
  CreateCommunityRequest,
  CreateCommunityResponse,
  GetAllCommunitiesResponse,
  GetCommunityResponse,
  UpdateCommunityRequest,
  UpdateCommunityResponse,
  GetCommunityPostsResponse,
} from '@summit/shared';

type DatabaseCommunity = Awaited<ReturnType<typeof createCommunity>>;

function toCommunityContract(community: DatabaseCommunity): Community {
  return {
    id: community.id,
    name: community.name,
    description: community.description,
    creatorId: community.creatorId,
    createdAt: community.createdAt.toISOString(),
  };
}

async function requireExistingCommunity(
  name: string,
): Promise<DatabaseCommunity> {
  const community = await getCommunityByName(name);
  if (!community) {
    throw new AppError(404, 'COMMUNITY_NOT_FOUND', 'Community not found.');
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
      409,
      'COMMUNITY_EXISTS',
      'Community name already exists.',
    );
  }
  const community = await createCommunity(data.name, data.description, userId);
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

export async function updateCommunityService(
  name: string,
  userId: number,
  data: UpdateCommunityRequest,
): Promise<UpdateCommunityResponse> {
  const existing = await requireExistingCommunity(name);
  if (existing.creatorId !== userId) {
    throw new AppError(
      403,
      'FORBIDDEN',
      "You cannot edit another user's community.",
    );
  }
  const community = await updateCommunity(existing.id, data.description);
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
