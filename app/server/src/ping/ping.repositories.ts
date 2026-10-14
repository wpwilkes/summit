import { prismaClient } from '../lib/prisma.js';

type TimestampRow = {
  timestamp: Date;
};

export async function pingDatabaseRepository(): Promise<string> {
  const rows = await prismaClient.$queryRaw<TimestampRow[]>`
    SELECT CURRENT_TIMESTAMP AS timestamp;
  `;
  return rows[0].timestamp.toISOString();
}
