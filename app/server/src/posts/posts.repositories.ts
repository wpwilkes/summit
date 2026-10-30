import { Prisma } from '../generated/prisma/client.js';
import { prismaClient } from '../lib/prisma.js';
import type { PostVoteValue } from '@summit/shared';

function normalizeVote(value: number | undefined): PostVoteValue {
  if (value === 1 || value === -1) {
    return value;
  }
  return 0;
}

export async function createPost(
  title: string,
  body: string,
  authorId: number,
  communityId: number,
) {
  return prismaClient.post.create({
    data: {
      title,
      body,
      authorId,
      communityId,
    },
  });
}

export async function getAllPosts() {
  return prismaClient.post.findMany({
    orderBy: [{ createdAt: 'desc' }],
  });
}

export async function getByIdPost(postId: number) {
  return prismaClient.post.findUnique({
    where: { id: postId },
  });
}

export async function getCommunityById(communityId: number) {
  return prismaClient.community.findUnique({
    where: { id: communityId },
  });
}

export async function removePost(postId: number) {
  return prismaClient.$transaction(async (tx) => {
    await tx.summary.deleteMany({
      where: { postId: postId },
    });
    await tx.comment.deleteMany({
      where: { postId: postId },
    });
    await tx.postVote.deleteMany({
      where: { postId: postId },
    });
    return tx.post.delete({
      where: { id: postId },
    });
  });
}

export async function updatePost(
  postId: number,
  data: {
    title?: string;
    body?: string;
  },
) {
  return prismaClient.post.update({
    where: { id: postId },
    data,
  });
}

export async function getPostVote(postId: number, userId: number) {
  const existingVote = await prismaClient.postVote.findUnique({
    where: {
      postId_userId: { postId, userId },
    },
  });
  return {
    vote: normalizeVote(existingVote?.value),
  };
}

export async function setPostVote(
  postId: number,
  userId: number,
  value: PostVoteValue,
) {
  return prismaClient.$transaction(
    async (tx) => {
      const post = await tx.post.findUnique({
        where: { id: postId },
      });
      const where = { postId_userId: { postId, userId } };
      const existing = await tx.postVote.findUnique({ where });
      const previous = existing?.value ?? 0;
      if (previous === value) {
        return { votes: post!.vote, userVote: value };
      }
      if (value === 0) {
        await tx.postVote.delete({ where });
      } else {
        await tx.postVote.upsert({
          where,
          create: { postId, userId, value },
          update: { value },
        });
      }
      const updated = await tx.post.update({
        where: { id: postId },
        data: {
          vote: { increment: value - previous },
        },
      });
      return {
        votes: updated.vote,
        userVote: value,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}
