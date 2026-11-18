import { z } from 'zod';

// One row in the search results list. It is a post plus the extra details the
// results page shows (who wrote it and how many comments it has).
export const SearchPostResultSchema = z.object({
  id: z.int().positive(),
  title: z.string().nonempty(),
  body: z.string().nonempty(),
  authorId: z.int().positive().optional(),
  authorUsername: z.string().nonempty().optional(),
  votes: z.int(),
  commentCount: z.int().nonnegative(),
  createdAt: z.iso.datetime(),
  isAnonymous: z.boolean(),
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

// Search by image: the request body is the raw image file (JPEG, PNG or WebP),
// sent with its own Content-Type such as image/jpeg, not JSON.
export const SEARCH_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export type SearchImageMimeType = (typeof SEARCH_IMAGE_MIME_TYPES)[number];

// Biggest image the server accepts (5 MB).
export const SEARCH_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

// keywords are the words the AI saw in the picture. The posts are the ones
// whose title, text or comments contain at least one of those words.
export const SearchByImageResponseSchema = z.object({
  keywords: z.array(z.string().nonempty()),
  posts: z.array(SearchPostResultSchema),
});
export type SearchByImageResponse = z.infer<typeof SearchByImageResponseSchema>;
