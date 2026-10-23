import { BASE_PATHS } from '../common/base.paths.js';

export const COMMENTS_PATHS = {
  create: `${BASE_PATHS.posts}/:postId/comments`,
  createReply: `${BASE_PATHS.comments}/:commentId/replies`,
  getAllForPost: `${BASE_PATHS.posts}/:postId/comments`,
  getVote: `${BASE_PATHS.comments}/:commentId/vote`,
  remove: `${BASE_PATHS.comments}/:commentId`,
  update: `${BASE_PATHS.comments}/:commentId`,
  vote: `${BASE_PATHS.comments}/:commentId/vote`,
} as const;
