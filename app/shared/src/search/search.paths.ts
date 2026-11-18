import { BASE_PATHS } from '../common/base.paths.js';

export const SEARCH_PATHS = {
  posts: `${BASE_PATHS.search}/posts`,
  image: `${BASE_PATHS.search}/image`,
} as const;
