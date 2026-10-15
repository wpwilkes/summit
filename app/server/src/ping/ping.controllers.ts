import { pingDatabaseService, pingServerService } from './ping.services.js';
import {
  PING_CONTRACTS,
  type PingDatabaseResponse,
  type PingServerResponse,
} from '@summit/shared';
import type { Request, Response } from 'express';

export async function pingDatabaseController(
  _request: Request,
  response: Response<PingDatabaseResponse>,
): Promise<void> {
  try {
    const result = PING_CONTRACTS.database.responseBody.parse({
      result: 'database ok',
      timestamp: await pingDatabaseService(),
    });
    response.status(200).json(result);
  } catch (error) {
    console.log(error);
    const result = PING_CONTRACTS.database.responseBody.parse({
      result: 'database error',
    });
    response.status(500).json(result);
  }
}

export function pingServerController(
  _request: Request,
  response: Response<PingServerResponse>,
): void {
  try {
    const result = PING_CONTRACTS.server.responseBody.parse({
      result: 'server ok',
      timestamp: pingServerService(),
    });
    response.status(200).json(result);
  } catch (error) {
    console.log(error);
    const result = PING_CONTRACTS.server.responseBody.parse({
      result: 'server error',
    });
    response.status(500).json(result);
  }
}
