import { getDatabaseUrl } from '../config/database.js';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl(),
});

export const prismaClient = new PrismaClient({
  adapter,
});
