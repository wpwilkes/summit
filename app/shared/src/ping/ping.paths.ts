import { BASE_PATHS } from '../common/base.paths.js';

export const PING_PATHS = {
  database: `${BASE_PATHS.ping}/database`,
  server: `${BASE_PATHS.ping}/server`,
} as const;
