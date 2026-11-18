import { HTTP_METHOD } from '../common/http.js';
import { SEARCH_PATHS } from './search.paths.js';
import {
  SEARCH_IMAGE_MIME_TYPES,
  SearchByImageResponseSchema,
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
  // The body is the image file itself, so there is no JSON request schema.
  image: {
    method: HTTP_METHOD.post,
    path: SEARCH_PATHS.image,
    requestContentTypes: SEARCH_IMAGE_MIME_TYPES,
    responseBody: SearchByImageResponseSchema,
  },
} as const;
