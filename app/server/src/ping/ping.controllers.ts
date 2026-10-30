import { HttpStatus } from '../errors/http-status.js';
import { pingDatabaseService, pingServerService } from './ping.services.js';
import {
  type PingDatabaseResponse,
  type PingServerResponse,
} from '@summit/shared';
import type { Request, Response } from 'express';

export async function pingDatabaseController(
  _request: Request,
  response: Response<PingDatabaseResponse>,
): Promise<void> {
  response.status(HttpStatus.OK).json({
    result: 'database ok',
    timestamp: await pingDatabaseService(),
  });
}

export function pingServerController(
  _request: Request,
  response: Response<PingServerResponse>,
): void {
  response.status(HttpStatus.OK).json({
    result: 'server ok',
    timestamp: pingServerService(),
  });
}
