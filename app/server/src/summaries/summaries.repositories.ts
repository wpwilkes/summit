import { prismaClient } from '../lib/prisma.js';

export async function getPostForSummary(postId: number) {
  return prismaClient.post.findUnique({
    where: { id: postId },
    select: { id: true, title: true, body: true },
  });
}

// Only comments that are still visible. Deleted ones must not be summarized.
export async function getCommentsForSummary(postId: number) {
  return prismaClient.comment.findMany({
    where: { postId, deletedAt: null },
    orderBy: [{ createdAt: 'asc' }],
    select: {
      id: true,
      parentId: true,
      body: true,
      isAnonymous: true,
      author: { select: { username: true } },
    },
  });
}

// The newest saved summary for a post, or null if there is none yet.
export async function getLatestSummary(postId: number) {
  return prismaClient.summary.findFirst({
    where: { postId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
}

export async function createSummary(
  postId: number,
  commentCount: number,
  summary: string,
) {
  return prismaClient.summary.create({
    data: { postId, commentCount, summary },
  });
}
