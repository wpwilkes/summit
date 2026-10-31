import { prismaClient } from '../../lib/prisma.js';

export async function consumeVerificationCode(email: string, codeHash: string) {
  return await prismaClient.user.update({
    where: { email, codeHash },
    data: {
      emailVerified: true,
    },
  });
}

export async function replaceVerificationCode(
  userId: number,
  codeHash: string,
) {
  await prismaClient.user.update({
    where: { id: userId },
    data: {
      codeHash: codeHash,
    },
  });
}
