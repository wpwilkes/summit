import { HTTP_METHOD } from '../common/http.js';
import { COMMENTS_PATHS } from './comments.paths.js';
import {
  CommentVoteRequestSchema,
  CommentVoteResponseSchema,
  CreateCommentRequestSchema,
  CreateCommentResponseSchema,
  CreateReplyRequestSchema,
  CreateReplyResponseSchema,
  CommentIdParamsSchema,
  GetAllForPostRequestSchema,
  GetAllForPostResponseSchema,
  GetCommentVoteRequestSchema,
  CommentPostIdParamsSchema,
  RemoveCommentResponseSchema,
  UpdateCommentRequestSchema,
  UpdateCommentResponseSchema,
  RemoveCommentRequestSchema,
} from './comments.schemas.js';

export const COMMENTS_CONTRACTS = {
  create: {
    method: HTTP_METHOD.post,
    path: COMMENTS_PATHS.create,
    params: CommentPostIdParamsSchema,
    requestBody: CreateCommentRequestSchema,
    responseBody: CreateCommentResponseSchema,
  },
  createReply: {
    method: HTTP_METHOD.post,
    path: COMMENTS_PATHS.createReply,
    params: CommentIdParamsSchema,
    requestBody: CreateReplyRequestSchema,
    responseBody: CreateReplyResponseSchema,
  },
  getAllForPost: {
    method: HTTP_METHOD.get,
    path: COMMENTS_PATHS.getAllForPost,
    params: CommentPostIdParamsSchema,
    requestBody: GetAllForPostRequestSchema,
    responseBody: GetAllForPostResponseSchema,
  },
  getVote: {
    method: HTTP_METHOD.get,
    path: COMMENTS_PATHS.getVote,
    params: CommentIdParamsSchema,
    requestBody: GetCommentVoteRequestSchema,
    responseBody: CommentVoteResponseSchema,
  },
  remove: {
    method: HTTP_METHOD.delete,
    path: COMMENTS_PATHS.remove,
    params: CommentIdParamsSchema,
    requestBody: RemoveCommentRequestSchema,
    responseBody: RemoveCommentResponseSchema,
  },
  update: {
    method: HTTP_METHOD.patch,
    path: COMMENTS_PATHS.update,
    params: CommentIdParamsSchema,
    requestBody: UpdateCommentRequestSchema,
    responseBody: UpdateCommentResponseSchema,
  },
  vote: {
    method: HTTP_METHOD.put,
    path: COMMENTS_PATHS.vote,
    params: CommentIdParamsSchema,
    requestBody: CommentVoteRequestSchema,
    responseBody: CommentVoteResponseSchema,
  },
} as const;
