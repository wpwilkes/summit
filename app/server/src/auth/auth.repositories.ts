import { prismaClient } from '../lib/prisma.js';

export async function createUnverifiedUser(
  email: string,
  username: string,
  passwordHash: string,
  codeHash: string,
) {
  return prismaClient.user.create({
    data: {
      email: email,
      username: username,
      passwordHash: passwordHash,
      codeHash: codeHash,
    },
  });
}

export async function findByEmail(email: string) {
  return prismaClient.user.findUnique({ where: { email: email } });
}

export async function findById(id: number) {
  return prismaClient.user.findUnique({ where: { id: id } });
}

export async function findByUsername(username: string) {
  return prismaClient.user.findUnique({ where: { username: username } });
}

export async function updateUsername(userId: number, username: string) {
  return prismaClient.user.update({
    where: {
      id: userId,
    },
    data: {
      username,
    },
  });
}

/*
 * PASSWORD RESET
 *
 * Saves a hashed reset code and its expiration time.
 * This is separate from the email-verification codeHash field.
 */
export async function savePasswordResetCode(
  userId: number,
  resetCodeHash: string,
  resetCodeExpiresAt: Date,
) {
  return prismaClient.user.update({
    where: {
      id: userId,
    },
    data: {
      resetCodeHash: resetCodeHash,
      resetCodeExpiresAt: resetCodeExpiresAt,
    },
  });
}

/*
 * PASSWORD RESET
 *
 * Updates the password only when:
 * - the email matches
 * - the reset-code hash matches
 * - the reset code has not expired
 *
 * The reset code is cleared after successful use.
 */
export async function consumePasswordResetCode(
  email: string,
  resetCodeHash: string,
  passwordHash: string,
) {
  return prismaClient.user.updateMany({
    where: {
      email: email,
      resetCodeHash: resetCodeHash,
      resetCodeExpiresAt: {
        gt: new Date(),
      },
    },
    data: {
      passwordHash: passwordHash,
      resetCodeHash: null,
      resetCodeExpiresAt: null,
    },
  });
}
