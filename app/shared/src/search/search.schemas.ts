import { z } from 'zod';

// One row in the search results list. It is a post plus the extra details the
// results page shows (who wrote it and how many comments it has).
export const SearchPostResultSchema = z.object({
  id: z.int().positive(),
  title: z.string().nonempty(),
  body: z.string().nonempty(),
  authorId: z.int().positive(),
  authorUsername: z.string().nonempty(),
  votes: z.int(),
  commentCount: z.int().nonnegative(),
  createdAt: z.iso.datetime(),
});
export type SearchPostResult = z.infer<typeof SearchPostResultSchema>;

// The keyword comes in the URL, e.g. /api/search/posts?q=hello.
// Spaces around it are trimmed, and an empty keyword is rejected.
export const SearchPostsQuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
});
export type SearchPostsQuery = z.infer<typeof SearchPostsQuerySchema>;

export const SearchPostsRequestSchema = z.undefined();
export type SearchPostsRequest = z.infer<typeof SearchPostsRequestSchema>;

export const SearchPostsResponseSchema = z.object({
  query: z.string(),
  posts: z.array(SearchPostResultSchema),
});
export type SearchPostsResponse = z.infer<typeof SearchPostsResponseSchema>;
