import { BASE_PATHS } from '../common/base.paths.js';

export const SUMMARIES_PATHS = {
  get: `${BASE_PATHS.posts}/:postId/summary`,
  generate: `${BASE_PATHS.posts}/:postId/summary`,
} as const;
