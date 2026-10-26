import { PostSchema } from '../posts/posts.schemas.js';
import { z } from 'zod';

export const CommunityNameSchema = z.string();

export const CommunitySchema = z.object({
  id: z.int().positive(),
  name: z.string(),
  description: z.string(),
  creatorId: z.int().positive(),
  createdAt: z.iso.datetime(),
});
export type Community = z.infer<typeof CommunitySchema>;

export const CommunityNameParamsSchema = z.object({
  name: CommunityNameSchema,
});
export type CommunityNameParams = z.infer<typeof CommunityNameParamsSchema>;

export const CreateCommunityRequestSchema = z.object({
  name: CommunityNameSchema,
  description: z.string(),
});
export type CreateCommunityRequest = z.infer<
  typeof CreateCommunityRequestSchema
>;

export const CreateCommunityResponseSchema = z.object({
  community: CommunitySchema,
});
export type CreateCommunityResponse = z.infer<
  typeof CreateCommunityResponseSchema
>;

export const GetAllCommunitiesResponseSchema = z.object({
  communities: z.array(CommunitySchema),
});
export type GetAllCommunitiesResponse = z.infer<
  typeof GetAllCommunitiesResponseSchema
>;

export const GetCommunityResponseSchema = z.object({
  community: CommunitySchema,
});
export type GetCommunityResponse = z.infer<typeof GetCommunityResponseSchema>;

export const UpdateCommunityRequestSchema = z.object({
  description: z.string(),
});
export type UpdateCommunityRequest = z.infer<
  typeof UpdateCommunityRequestSchema
>;

export const UpdateCommunityResponseSchema = z.object({
  community: CommunitySchema,
});
export type UpdateCommunityResponse = z.infer<
  typeof UpdateCommunityResponseSchema
>;

export const GetCommunityPostsResponseSchema = z.object({
  posts: z.array(PostSchema),
});
export type GetCommunityPostsResponse = z.infer<
  typeof GetCommunityPostsResponseSchema
>;
