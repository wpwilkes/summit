import { Prisma } from '../generated/prisma/client.js';
import { prismaClient } from '../lib/prisma.js';
import type { PostVoteValue } from '@summit/shared';

function _normalizeVote(value: number | undefined): PostVoteValue {
  if (value === 1 || value === -1) {
    return value;
  }
  return 0;
}

export async function createPost(
  title: string,
  body: string,
  authorId: number,
) {
  return prismaClient.post.create({
    data: {
      title,
      body,
      authorId,
    },
  });
}

export async function getAllPosts() {
  return prismaClient.post.findMany({
    orderBy: [{ createdAt: 'desc' }],
  });
}

export async function getByIdPost(id: number) {
  return prismaClient.post.findUnique({
    where: { id },
  });
}

export async function removePost(id: number) {
  return prismaClient.$transaction(async (tx) => {
    await tx.summary.deleteMany({
      where: { postId: id },
    });

    await tx.comment.deleteMany({
      where: { postId: id },
    });

    return tx.post.delete({
      where: { id },
    });
  });
}

export async function updatePost(
  id: number,
  data: {
    title?: string;
    body?: string;
  },
) {
  return prismaClient.post.update({
    where: { id },
    data,
  });
}

export async function getPostVote(postId: number, userId: number) {
  const post = await prismaClient.post.findUnique({
    where: { id: postId },
    select: { vote: true },
  });

  if (!post) {
    return null;
  }

  const existingVote = await prismaClient.postVote.findUnique({
    where: {
      postId_userId: { postId, userId },
    },
  });

  return {
    votes: post.vote,
    userVote: _normalizeVote(existingVote?.value),
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

      if (!post) return null;

      const where = {
        postId_userId: { postId, userId },
      };

      const existing = await tx.postVote.findUnique({ where });
      const previous = _normalizeVote(existing?.value);

      if (previous === value) {
        return { votes: post.vote, userVote: value };
      }

      if (value === 0) {
        if (existing) {
          await tx.postVote.delete({ where });
        }
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
