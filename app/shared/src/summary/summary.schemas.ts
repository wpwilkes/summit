import { z } from "zod";

// Post and comment text only, no usernames. Comments are optional because
// a new post may not have any yet. Limits match what the app allows.
export const SummarizeRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10000),
  comments: z.array(z.string().min(1).max(2000)).max(200).optional(),
});
export type SummarizeRequest = z.infer<typeof SummarizeRequestSchema>;

export const SummarizeResponseSchema = z.object({
  summary: z.string(),
});
export type SummarizeResponse = z.infer<typeof SummarizeResponseSchema>;
