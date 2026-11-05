import { createSummary } from './summaries.repositories.js';
import type { Summary } from '@summit/shared';

export type DatabaseSummary = Awaited<ReturnType<typeof createSummary>>;

export function toSummaryContract(summary: DatabaseSummary): Summary {
  return {
    id: summary.id,
    postId: summary.postId,
    commentCount: summary.commentCount,
    summary: summary.summary,
    createdAt: summary.createdAt.toISOString(),
  };
}
