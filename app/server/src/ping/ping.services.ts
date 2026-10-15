import { pingDatabaseRepository } from './ping.repositories.js';

export async function pingDatabaseService(): Promise<string> {
  return await pingDatabaseRepository();
}

export function pingServerService(): string {
  return new Date(Date.now()).toISOString();
}
