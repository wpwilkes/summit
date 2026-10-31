import { z } from 'zod';

export const PostSchema = z.object({
  id: z.int().positive(),
  communityId: z.int().positive(),
  title: z.string().nonempty(),
  body: z.string(),
  photoUrl: z
    .string()
    .regex(/^\/api\/posts\/images\/[0-9a-f-]+\.(jpg|png|webp)$/)
    .optional(),
  photoWidth: z.int().positive().optional(),
  photoHeight: z.int().positive().optional(),
  authorUsername: z.string().optional(),
  communityName: z.string().optional(),
  commentCount: z.int().nonnegative().optional(),
  authorId: z.int().positive(),
  votes: z.int(),
  createdAt: z.iso.datetime(),
});
export type Post = z.infer<typeof PostSchema>;

export const PostIdParamsSchema = z.object({
  postId: z.coerce.number().int().positive(),
});
export type PostIdParams = z.infer<typeof PostIdParamsSchema>;

export const CreatePostRequestSchema = z
  .object({
    communityId: z.int().positive(),
    title: z.string().nonempty(),
    body: z.string(),
    photoUrl: z
      .string()
      .regex(/^\/api\/posts\/images\/[0-9a-f-]+\.(jpg|png|webp)$/)
      .optional(),
    photoWidth: z.int().positive().optional(),
    photoHeight: z.int().positive().optional(),
  })
  .refine((data) => !!data.body.trim() || !!data.photoUrl, {
    message: 'A post must contain text or a photo.',
  });
export type CreatePostRequest = z.infer<typeof CreatePostRequestSchema>;

export const CreatePostResponseSchema = z.object({
  post: PostSchema,
});
export type CreatePostResponse = z.infer<typeof CreatePostResponseSchema>;

export const GetAllPostsRequestSchema = z.object({});
export type GetAllPostsRequest = z.infer<typeof GetAllPostsRequestSchema>;

export const GetAllPostsResponseSchema = z.object({
  posts: z.array(PostSchema),
});
export type GetAllPostsResponse = z.infer<typeof GetAllPostsResponseSchema>;

export const GetByIdPostRequestSchema = z.undefined();
export type GetByIdPostRequest = z.infer<typeof GetByIdPostRequestSchema>;

export const GetByIdPostResponseSchema = z.object({
  post: PostSchema,
});
export type GetByIdPostResponse = z.infer<typeof GetByIdPostResponseSchema>;

export const GetVoteRequestSchema = z.undefined();
export type GetVoteRequest = z.infer<typeof GetVoteRequestSchema>;

export const PostVoteValueSchema = z.union([
  z.literal(-1),
  z.literal(0),
  z.literal(1),
]);
export type PostVoteValue = z.infer<typeof PostVoteValueSchema>;

export const PostVoteRequestSchema = z.object({
  value: PostVoteValueSchema,
});
export type PostVoteRequest = z.infer<typeof PostVoteRequestSchema>;

export const PostVoteResponseSchema = z.object({
  votes: z.int(),
  userVote: PostVoteValueSchema,
});
export type PostVoteResponse = z.infer<typeof PostVoteResponseSchema>;

export const RemovePostRequestSchema = z.undefined();
export type RemovePostRequest = z.infer<typeof RemovePostRequestSchema>;

export const RemovePostResponseSchema = z.object({
  success: z.literal(true),
});
export type RemovePostResponse = z.infer<typeof RemovePostResponseSchema>;

export const UpdatePostRequestSchema = z
  .object({
    title: z.string().optional(),
    communityId: z.int().positive().optional(),
    body: z.string().optional(),
    photoUrl: z
      .string()
      .regex(/^\/api\/posts\/images\/[0-9a-f-]+\.(jpg|png|webp)$/)
      .nullable()
      .optional(),
    photoWidth: z.int().positive().nullable().optional(),
    photoHeight: z.int().positive().nullable().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.body !== undefined ||
      data.communityId !== undefined ||
      data.photoUrl !== undefined,
    {
      message: 'Provide a title or body to update.',
    },
  );
export type UpdatePostRequest = z.infer<typeof UpdatePostRequestSchema>;

export const UpdatePostResponseSchema = z.object({
  post: PostSchema,
});
export type UpdatePostResponse = z.infer<typeof UpdatePostResponseSchema>;
