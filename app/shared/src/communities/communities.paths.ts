import { BASE_PATHS } from '../common/base.paths.js';

export const COMMUNITIES_PATHS = {
  create: BASE_PATHS.communities,
  getAll: BASE_PATHS.communities,
  getByName: `${BASE_PATHS.communities}/:name`,
  getPosts: `${BASE_PATHS.communities}/:name/posts`,
  update: `${BASE_PATHS.communities}/:name`,
} as const;
