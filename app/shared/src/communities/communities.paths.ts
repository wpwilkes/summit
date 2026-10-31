import { BASE_PATHS } from '../common/base.paths.js';

export const COMMUNITIES_PATHS = {
  create: BASE_PATHS.communities,

  getAll: BASE_PATHS.communities,

  getJoined: `${BASE_PATHS.communities}/joined`,

  getByName: `${BASE_PATHS.communities}/:name`,

  getPosts: `${BASE_PATHS.communities}/:name/posts`,

  join: `${BASE_PATHS.communities}/:name/join`,

  leave: `${BASE_PATHS.communities}/:name/join`,

  update: `${BASE_PATHS.communities}/:name`,
} as const;