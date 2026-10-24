import { HTTP_METHOD } from '../common/http.js';
import { PING_PATHS } from './ping.paths.js';
import {
  PingDatabaseRequestSchema,
  PingDatabaseResponseSchema,
  PingServerRequestSchema,
  PingServerResponseSchema,
} from './ping.schemas.js';

export const PING_CONTRACTS = {
  database: {
    method: HTTP_METHOD.get,
    path: PING_PATHS.database,
    requestBody: PingDatabaseRequestSchema,
    responseBody: PingDatabaseResponseSchema,
  },
  server: {
    method: HTTP_METHOD.get,
    path: PING_PATHS.server,
    requestBody: PingServerRequestSchema,
    responseBody: PingServerResponseSchema,
  },
} as const;
