import { prismaClient } from '../lib/prisma.js';

export async function createUser(
  email: string,
  username: string,
  passwordHash: string,
) {
  return prismaClient.user.create({
    data: { email, username, passwordHash },
  });
}

export async function findByEmail(email: string) {
  return prismaClient.user.findUnique({ where: { email } });
}

export async function findById(id: number) {
  return prismaClient.user.findUnique({ where: { id } });
}

export async function findByUsername(username: string) {
  return prismaClient.user.findUnique({ where: { username } });
}
