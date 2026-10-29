import { prismaClient } from '../../lib/prisma.js';

export async function consumeVerificationCode(
  email: string,
  codeHash: string,
): Promise<boolean> {
  const user = await prismaClient.user.findUnique({
    where: { email },
    select: {
      id: true,
      emailVerifiedAt: true,
    },
  });
  if (!user || user.emailVerifiedAt !== null) {
    return false;
  }
  return prismaClient.$transaction(async (tx) => {
    const now = new Date();
    const consumed = await tx.emailVerification.deleteMany({
      where: {
        userId: user.id,
        codeHash,
        expiresAt: { gt: now },
        failedAttempts: { lt: 5 },
      },
    });
    if (consumed.count === 1) {
      const updated = await tx.user.updateMany({
        where: {
          id: user.id,
          emailVerifiedAt: null,
        },
        data: {
          emailVerifiedAt: now,
        },
      });
      return updated.count === 1;
    }
    await tx.emailVerification.updateMany({
      where: {
        userId: user.id,
        codeHash: { not: codeHash },
        expiresAt: { gt: now },
        failedAttempts: { lt: 5 },
      },
      data: {
        failedAttempts: { increment: 1 },
      },
    });
    return false;
  });
}

export async function createUnverifiedUser(
  email: string,
  username: string,
  passwordHash: string,
  codeHash: string,
  expiresAt: Date,
) {
  return prismaClient.user.create({
    data: {
      email,
      username,
      passwordHash,
      emailVerification: {
        create: {
          codeHash,
          expiresAt,
        },
      },
    },
  });
}

export async function replaceVerificationCode(
  userId: number,
  codeHash: string,
  expiresAt: Date,
): Promise<boolean> {
  const now = new Date();
  const cooldownEnd = new Date(now.getTime() - 60_000);
  const updated = await prismaClient.emailVerification.updateMany({
    where: {
      userId,
      sentAt: { lte: cooldownEnd },
      user: {
        is: {
          emailVerifiedAt: null,
        },
      },
    },
    data: {
      codeHash,
      expiresAt,
      sentAt: now,
      failedAttempts: 0,
    },
  });
  return updated.count === 1;
}
