import { requireAuth } from '../auth/middleware/middleware.js';
import {
  imageTooLargeHandler,
  searchByImageController,
  searchPostsController,
} from './search.controllers.js';
import {
  SEARCH_CONTRACTS,
  SEARCH_IMAGE_MAX_BYTES,
  SEARCH_IMAGE_MIME_TYPES,
} from '@summit/shared';
import express, { Router } from 'express';

const searchRouter: Router = Router();

// Searching is public, just like reading the post list, so no login is needed.
searchRouter.get(SEARCH_CONTRACTS.posts.path, searchPostsController);

// Search by image calls the AI, which costs money, so only signed-in users can
// use it. The body is the image file itself.
searchRouter.post(
  SEARCH_CONTRACTS.image.path,
  requireAuth,
  express.raw({
    type: [...SEARCH_IMAGE_MIME_TYPES],
    limit: SEARCH_IMAGE_MAX_BYTES,
  }),
  searchByImageController,
  imageTooLargeHandler,
);

export default searchRouter;
