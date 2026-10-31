import { prismaClient } from '../lib/prisma.js';

export async function createCommunity(
  name: string,
  description: string,
  topic: string,
  subtopic: string,
  creatorId: number,
) {
  return prismaClient.community.create({
    data: {
      name: name,
      description: description,
      topic: topic,
      subtopic: subtopic,
      creatorId: creatorId,

      memberships: {
        create: {
          user: {
            connect: {
              id: creatorId,
            },
          },
        },
      },
    },

    include: {
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });
}

export async function getAllCommunities() {
  return prismaClient.community.findMany({
    include: {
      _count: {
        select: {
          memberships: true,
        },
      },
    },

    orderBy: {
      name: 'asc',
    },
  });
}

export async function getCommunityByName(
  name: string,
) {
  return prismaClient.community.findUnique({
    where: {
      name: name,
    },

    include: {
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });
}

export async function getCommunityById(
  id: number,
) {
  return prismaClient.community.findUnique({
    where: {
      id: id,
    },

    include: {
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });
}

export async function getCommunityPosts(
  communityId: number,
) {
  return prismaClient.post.findMany({
    where: {
      communityId: communityId,
    },
    orderBy: [
      {
        createdAt: 'desc',
      },
      {
        id: 'desc',
      },
    ],
  });
}

export async function updateCommunity(
  id: number,
  description: string,
) {
  return prismaClient.community.update({
    where: {
      id: id,
    },

    data: {
      description: description,
    },

    include: {
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });
}

/*
 * JOIN COMMUNITY
 *
 * upsert means:
 * - if membership does not exist -> create it
 * - if it already exists -> keep it
 *
 * This prevents duplicate membership errors.
 */
export async function joinCommunity(
  userId: number,
  communityId: number,
) {
  return prismaClient.communityMembership.upsert({
    where: {
      userId_communityId: {
        userId: userId,
        communityId: communityId,
      },
    },
    update: {},
    create: {
      userId: userId,
      communityId: communityId,
    },
  });
}

/*
 * LEAVE COMMUNITY
 *
 * deleteMany is used so leaving a community
 * that is already not joined does not crash.
 */
export async function leaveCommunity(
  userId: number,
  communityId: number,
) {
  return prismaClient.communityMembership.deleteMany({
    where: {
      userId: userId,
      communityId: communityId,
    },
  });
}

/*
 * GET COMMUNITIES JOINED BY ONE USER
 */
export async function getJoinedCommunities(
  userId: number,
) {
  return prismaClient.community.findMany({
    where: {
      memberships: {
        some: {
          userId: userId,
        },
      },
    },

    include: {
      _count: {
        select: {
          memberships: true,
        },
      },
    },

    orderBy: {
      name: 'asc',
    },
  });
}