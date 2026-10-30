import { searchPostsController } from './search.controllers.js';
import { SEARCH_CONTRACTS } from '@summit/shared';
import { Router } from 'express';

const searchRouter: Router = Router();

// Searching is public, just like reading the post list, so no login is needed.
searchRouter.get(SEARCH_CONTRACTS.posts.path, searchPostsController);

export default searchRouter;
