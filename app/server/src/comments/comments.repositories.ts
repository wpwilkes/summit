import { Prisma } from '../generated/prisma/client.js';
import { prismaClient } from '../lib/prisma.js';
import type { CommentVoteValue } from '@summit/shared';

type SetCommentVoteResult =
  | { status: 'not_found' }
  | { status: 'deleted' }
  | {
      status: 'ok';
      votes: number;
      userVote: CommentVoteValue;
    };

function normalizeCommentVote(value: number | undefined): CommentVoteValue {
  if (value === 1 || value === -1) {
    return value;
  }
  return 0;
}

export async function createComment(
  postId: number,
  authorId: number,
  body: string,
  parentId: number | null = null,
) {
  return prismaClient.comment.create({
    data: {
      postId,
      authorId,
      body,
      parentId,
    },
  });
}

export async function getByIdPost(postId: number) {
  return prismaClient.post.findUnique({
    where: { id: postId },
  });
}

export async function getCommentById(commentId: number) {
  return prismaClient.comment.findUnique({
    where: { id: commentId },
  });
}

export async function getCommentsByPostId(postId: number) {
  return prismaClient.comment.findMany({
    where: { postId: postId },
    orderBy: [{ createdAt: 'asc' }],
  });
}

export async function getCommentVote(commentId: number, userId: number) {
  const comment = await prismaClient.comment.findUnique({
    where: { id: commentId },
    select: { vote: true },
  });
  if (!comment) {
    return null;
  }
  const existingVote = await prismaClient.commentVote.findUnique({
    where: {
      commentId_userId: {
        commentId,
        userId,
      },
    },
  });
  return {
    votes: comment.vote,
    userVote: normalizeCommentVote(existingVote?.value),
  };
}

export async function removeCommentById(commentId: number) {
  return prismaClient.comment.update({
    where: { id: commentId },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function setCommentVote(
  commentId: number,
  userId: number,
  value: CommentVoteValue,
): Promise<SetCommentVoteResult> {
  return prismaClient.$transaction(
    async (tx): Promise<SetCommentVoteResult> => {
      const comment = await tx.comment.findUnique({
        where: { id: commentId },
        select: { vote: true, deletedAt: true },
      });
      if (!comment) return { status: 'not_found' };
      if (comment.deletedAt) return { status: 'deleted' };
      const where = {
        commentId_userId: { commentId, userId },
      };
      const existing = await tx.commentVote.findUnique({ where });
      const previous = normalizeCommentVote(existing?.value);
      if (previous === value) {
        return {
          status: 'ok',
          votes: comment.vote,
          userVote: value,
        };
      }
      if (value === 0) {
        if (existing) {
          await tx.commentVote.delete({ where });
        }
      } else {
        await tx.commentVote.upsert({
          where,
          create: { commentId, userId, value },
          update: { value },
        });
      }

      const updated = await tx.comment.update({
        where: { id: commentId },
        data: {
          vote: { increment: value - previous },
        },
        select: { vote: true },
      });

      return {
        status: 'ok',
        votes: updated.vote,
        userVote: value,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function updateCommentById(commentId: number, body: string) {
  return prismaClient.comment.update({
    where: { id: commentId },
    data: { body },
  });
}
