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
