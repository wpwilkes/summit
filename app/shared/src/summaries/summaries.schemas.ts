import { z } from 'zod';

// One saved AI summary of a post and its comments.
// commentCount is how many comments the summary was based on, so the app can
// tell when new comments have arrived since the summary was made.
export const SummarySchema = z.object({
  id: z.int().positive(),
  postId: z.int().positive(),
  commentCount: z.int().nonnegative(),
  summary: z.string().nonempty(),
  createdAt: z.iso.datetime(),
});
export type Summary = z.infer<typeof SummarySchema>;

export const SummaryPostIdParamsSchema = z.object({
  postId: z.coerce.number().int().positive(),
});
export type SummaryPostIdParams = z.infer<typeof SummaryPostIdParamsSchema>;

export const GetSummaryRequestSchema = z.undefined();
export type GetSummaryRequest = z.infer<typeof GetSummaryRequestSchema>;

// summary is null when nobody has generated one for this post yet.
export const GetSummaryResponseSchema = z.object({
  summary: SummarySchema.nullable(),
});
export type GetSummaryResponse = z.infer<typeof GetSummaryResponseSchema>;

export const GenerateSummaryRequestSchema = z.undefined();
export type GenerateSummaryRequest = z.infer<
  typeof GenerateSummaryRequestSchema
>;

export const GenerateSummaryResponseSchema = z.object({
  summary: SummarySchema,
});
export type GenerateSummaryResponse = z.infer<
  typeof GenerateSummaryResponseSchema
>;
