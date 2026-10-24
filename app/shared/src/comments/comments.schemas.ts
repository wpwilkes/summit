import { z } from 'zod';

const CommentBodySchema = z.string().trim().min(1).max(10000);

export const CommentSchema = z.object({
  id: z.int().positive(),
  postId: z.int().positive(),
  authorId: z.int().positive(),
  parentId: z.int().nullable(),
  body: CommentBodySchema,
  votes: z.int(),
  deleted: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type Comment = z.infer<typeof CommentSchema>;

export const CommentIdParamsSchema = z.object({
  commentId: z.coerce.number().int().positive(),
});

export const CommentPostIdParamsSchema = z.object({
  postId: z.coerce.number().int().positive(),
});

export const CommentVoteValueSchema = z.union([
  z.literal(-1),
  z.literal(0),
  z.literal(1),
]);
export type CommentVoteValue = z.infer<typeof CommentVoteValueSchema>;

export const CommentVoteRequestSchema = z.object({
  value: CommentVoteValueSchema,
});
export type CommentVoteRequest = z.infer<typeof CommentVoteRequestSchema>;

export const CommentVoteResponseSchema = z.object({
  votes: z.int(),
  userVote: CommentVoteValueSchema,
});
export type CommentVoteResponse = z.infer<typeof CommentVoteResponseSchema>;

export const CreateCommentRequestSchema = z.object({
  body: CommentBodySchema,
});
export type CreateCommentRequest = z.infer<typeof CreateCommentRequestSchema>;

export const CreateCommentResponseSchema = z.object({
  comment: CommentSchema,
});
export type CreateCommentResponse = z.infer<typeof CreateCommentResponseSchema>;

export const CreateReplyRequestSchema = CreateCommentRequestSchema;
export type CreateReplyRequest = z.infer<typeof CreateReplyRequestSchema>;

export const CreateReplyResponseSchema = z.object({
  comment: CommentSchema,
});
export type CreateReplyResponse = z.infer<typeof CreateReplyResponseSchema>;

export const GetAllForPostRequestSchema = z.undefined();
export type GetAllForPostRequest = z.infer<typeof GetAllForPostRequestSchema>;

export const GetAllForPostResponseSchema = z.object({
  comments: z.array(CommentSchema),
});
export type GetAllForPostResponse = z.infer<typeof GetAllForPostResponseSchema>;

export const GetCommentVoteRequestSchema = z.undefined();
export type GetCommentVoteRequest = z.infer<typeof GetCommentVoteRequestSchema>;

export const RemoveCommentRequestSchema = z.undefined();
export type RemoveCommentRequest = z.infer<typeof RemoveCommentRequestSchema>;

export const RemoveCommentResponseSchema = z.object({
  success: z.literal(true),
});
export type RemoveCommentResponse = z.infer<typeof RemoveCommentResponseSchema>;

export const UpdateCommentRequestSchema = z.object({
  body: CommentBodySchema,
});
export type UpdateCommentRequest = z.infer<typeof UpdateCommentRequestSchema>;

export const UpdateCommentResponseSchema = z.object({
  comment: CommentSchema,
});
export type UpdateCommentResponse = z.infer<typeof UpdateCommentResponseSchema>;
