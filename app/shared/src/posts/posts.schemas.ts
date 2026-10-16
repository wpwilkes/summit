import { z } from "zod";

export const PostSchema = z.object({
  id: z.int(),
  title: z.string(),
  body: z.string(),
  authorId: z.int(),
  votes: z.int(),
  createdAt: z.iso.datetime(),
});
export type Post = z.infer<typeof PostSchema>;

export const CreatePostRequestSchema = z.object({
  title: z.string(),
  body: z.string(),
  authorId: z.int(),
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
