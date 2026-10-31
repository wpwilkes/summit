import { requireAuth } from '../auth/middleware/middleware.js';
import {
  createCommentController,
  createReplyController,
  getCommentVoteController,
  getPostCommentsController,
  removeCommentController,
  updateCommentController,
  voteCommentController,
} from './comments.controllers.js';
import { COMMENTS_CONTRACTS } from '@summit/shared';
import { Router } from 'express';

const commentsRouter = Router();

commentsRouter.post(
  COMMENTS_CONTRACTS.create.path,
  requireAuth,
  createCommentController,
);
commentsRouter.post(
  COMMENTS_CONTRACTS.createReply.path,
  requireAuth,
  createReplyController,
);
commentsRouter.get(
  COMMENTS_CONTRACTS.getVote.path,
  requireAuth,
  getCommentVoteController,
);
commentsRouter.get(
  COMMENTS_CONTRACTS.getAllForPost.path,
  getPostCommentsController,
);
commentsRouter.delete(
  COMMENTS_CONTRACTS.remove.path,
  requireAuth,
  removeCommentController,
);
commentsRouter.patch(
  COMMENTS_CONTRACTS.update.path,
  requireAuth,
  updateCommentController,
);
commentsRouter.put(
  COMMENTS_CONTRACTS.vote.path,
  requireAuth,
  voteCommentController,
);

export default commentsRouter;
