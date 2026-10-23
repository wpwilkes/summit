import { BASE_PATHS } from '../common/base.paths.js';

export const POSTS_PATHS = {
  create: BASE_PATHS.posts,
  getAll: BASE_PATHS.posts,
  getById: `${BASE_PATHS.posts}/:postId`,
  getVote: `${BASE_PATHS.posts}/:postId/vote`,
  remove: `${BASE_PATHS.posts}/:postId`,
  update: `${BASE_PATHS.posts}/:postId`,
  vote: `${BASE_PATHS.posts}/:postId/vote`,
} as const;
