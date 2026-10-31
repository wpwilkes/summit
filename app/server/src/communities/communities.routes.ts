import { requireAuth } from '../auth/middleware/middleware.js';

import {
  createCommunityController,
  getAllCommunitiesController,
  getCommunityController,
  getCommunityPostsController,
  getJoinedCommunitiesController,
  joinCommunityController,
  leaveCommunityController,
  updateCommunityController,
} from './communities.controllers.js';

import {
  COMMUNITIES_CONTRACTS,
} from '@summit/shared';

import {
  Router,
} from 'express';

const communitiesRouter =
  Router();

/*
 * CREATE COMMUNITY
 */
communitiesRouter.post(
  COMMUNITIES_CONTRACTS.create.path,
  requireAuth,
  createCommunityController,
);

/*
 * GET ALL COMMUNITIES
 */
communitiesRouter.get(
  COMMUNITIES_CONTRACTS.getAll.path,
  getAllCommunitiesController,
);

/*
 * GET CURRENT USER'S
 * JOINED COMMUNITIES
 *
 * IMPORTANT:
 * Keep this route before /:name,
 * otherwise Express could treat
 * "joined" as a community name.
 */
communitiesRouter.get(
  COMMUNITIES_CONTRACTS.getJoined.path,
  requireAuth,
  getJoinedCommunitiesController,
);

/*
 * GET POSTS FOR ONE COMMUNITY
 */
communitiesRouter.get(
  COMMUNITIES_CONTRACTS.getPosts.path,
  getCommunityPostsController,
);

/*
 * JOIN COMMUNITY
 */
communitiesRouter.post(
  COMMUNITIES_CONTRACTS.join.path,
  requireAuth,
  joinCommunityController,
);

/*
 * LEAVE COMMUNITY
 */
communitiesRouter.delete(
  COMMUNITIES_CONTRACTS.leave.path,
  requireAuth,
  leaveCommunityController,
);

/*
 * GET ONE COMMUNITY
 */
communitiesRouter.get(
  COMMUNITIES_CONTRACTS.getByName.path,
  getCommunityController,
);

/*
 * UPDATE COMMUNITY
 */
communitiesRouter.patch(
  COMMUNITIES_CONTRACTS.update.path,
  requireAuth,
  updateCommunityController,
);

export default communitiesRouter;
