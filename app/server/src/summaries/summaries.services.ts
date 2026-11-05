import { AppError } from '../errors/app.error.js';
import { ErrorCode } from '../errors/error-code.js';
import { HttpStatus } from '../errors/http-status.js';
import { toSummaryContract } from './summaries.mapper.js';
import { askOpenRouter } from './summaries.openrouter.js';
import { buildSummaryMessages } from './summaries.prompt.js';
import {
  createSummary,
  getCommentsForSummary,
  getLatestSummary,
  getPostForSummary,
} from './summaries.repositories.js';
import type {
  GenerateSummaryResponse,
  GetSummaryResponse,
} from '@summit/shared';

async function requireExistingPost(postId: number) {
  const post = await getPostForSummary(postId);
  if (!post) {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.POST_NOT_FOUND,
      'Post not found.',
    );
  }
  return post;
}

// Show the last summary that was saved, without calling the AI again.
export async function getSummaryService(
  postId: number,
): Promise<GetSummaryResponse> {
  await requireExistingPost(postId);
  const latest = await getLatestSummary(postId);
  return {
    summary: latest ? toSummaryContract(latest) : null,
  };
}

// Make a brand new summary from the post and its comments as they are right
// now, then save it. Calling this again always starts from fresh data.
export async function generateSummaryService(
  postId: number,
): Promise<GenerateSummaryResponse> {
  const post = await requireExistingPost(postId);
  const comments = await getCommentsForSummary(postId);
  const text = await askOpenRouter(buildSummaryMessages(post, comments));
  const saved = await createSummary(postId, comments.length, text);
  return {
    summary: toSummaryContract(saved),
  };
}
