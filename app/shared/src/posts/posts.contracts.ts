import { HTTP_METHOD } from "../common/http.js";
import { POSTS_PATHS } from "./posts.paths.js";
import {
  CreatePostRequestSchema,
  CreatePostResponseSchema,
  GetAllPostsRequestSchema,
  GetAllPostsResponseSchema,
} from "./posts.schemas.js";

export const POSTS_CONTRACTS = {
  create: {
    method: HTTP_METHOD.post,
    path: POSTS_PATHS.create,
    requestBody: CreatePostRequestSchema,
    responseBody: CreatePostResponseSchema,
  },
  getAll: {
    method: HTTP_METHOD.get,
    path: POSTS_PATHS.getAll,
    requestBody: GetAllPostsRequestSchema,
    responseBody: GetAllPostsResponseSchema,
  },
} as const;
