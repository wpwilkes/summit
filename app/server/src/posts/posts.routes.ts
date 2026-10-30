import { requireAuth } from '../auth/middleware/middleware.js';
import {
  createPostController,
  getAllPostsController,
  getByIdPostController,
  getPostVoteController,
  removePostController,
  updatePostController,
  votePostController,
} from './posts.controllers.js';
import { POSTS_CONTRACTS } from '@summit/shared';
import { Router } from 'express';

const postsRouter = Router();

postsRouter.post(
  POSTS_CONTRACTS.create.path,
  requireAuth,
  createPostController,
);
postsRouter.get(POSTS_CONTRACTS.getAll.path, getAllPostsController);
postsRouter.get(POSTS_CONTRACTS.getById.path, getByIdPostController);
postsRouter.get(
  POSTS_CONTRACTS.getVote.path,
  requireAuth,
  getPostVoteController,
);
postsRouter.delete(
  POSTS_CONTRACTS.remove.path,
  requireAuth,
  removePostController,
);
postsRouter.patch(
  POSTS_CONTRACTS.update.path,
  requireAuth,
  updatePostController,
);
postsRouter.put(POSTS_CONTRACTS.vote.path, requireAuth, votePostController);

export default postsRouter;
