import { prismaClient } from '../lib/prisma.js';

export async function createCommunity(
  name: string,
  description: string,
  creatorId: number,
) {
  return prismaClient.community.create({
    data: {
      name: name,
      description: description,
      creatorId: creatorId,
    },
  });
}

export async function getAllCommunities() {
  return prismaClient.community.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getCommunityByName(name: string) {
  return prismaClient.community.findUnique({
    where: { name: name },
  });
}

export async function getCommunityById(id: number) {
  return prismaClient.community.findUnique({
    where: { id: id },
  });
}

export async function getCommunityPosts(communityId: number) {
  return prismaClient.post.findMany({
    where: { communityId: communityId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
}

export async function updateCommunity(id: number, description: string) {
  return prismaClient.community.update({
    where: { id: id },
    data: { description: description },
  });
}
