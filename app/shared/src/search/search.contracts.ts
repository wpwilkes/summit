import { HTTP_METHOD } from '../common/http.js';
import { SEARCH_PATHS } from './search.paths.js';
import {
  SearchPostsQuerySchema,
  SearchPostsRequestSchema,
  SearchPostsResponseSchema,
} from './search.schemas.js';

export const SEARCH_CONTRACTS = {
  posts: {
    method: HTTP_METHOD.get,
    path: SEARCH_PATHS.posts,
    query: SearchPostsQuerySchema,
    requestBody: SearchPostsRequestSchema,
    responseBody: SearchPostsResponseSchema,
  },
} as const;
