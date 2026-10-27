import { requireAuth } from '../auth/auth.middleware.js';
import {
  createCommunityController,
  getAllCommunitiesController,
  getCommunityController,
  updateCommunityController,
  getCommunityPostsController,
} from './communities.controllers.js';
import { COMMUNITIES_CONTRACTS } from '@summit/shared';
import { Router } from 'express';

const communitiesRouter: Router = Router();

communitiesRouter.post(
  COMMUNITIES_CONTRACTS.create.path,
  requireAuth,
  createCommunityController,
);
communitiesRouter.get(
  COMMUNITIES_CONTRACTS.getAll.path,
  getAllCommunitiesController,
);
communitiesRouter.get(
  COMMUNITIES_CONTRACTS.getPosts.path,
  getCommunityPostsController,
);
communitiesRouter.get(
  COMMUNITIES_CONTRACTS.getByName.path,
  getCommunityController,
);
communitiesRouter.patch(
  COMMUNITIES_CONTRACTS.update.path,
  requireAuth,
  updateCommunityController,
);

export default communitiesRouter;
