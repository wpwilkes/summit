import { AppError } from '../errors/app.error.js';
import { searchPostsService } from './search.services.js';
import {
  SEARCH_CONTRACTS,
  type SearchPostsRequest,
  type SearchPostsResponse,
} from '@summit/shared';
import type { Request, Response } from 'express';

export async function searchPostsController(
  request: Request<Record<string, never>, unknown, SearchPostsRequest>,
  response: Response<SearchPostsResponse>,
): Promise<void> {
  // The keyword must be present, not blank, and at most 100 characters.
  const parsed = SEARCH_CONTRACTS.posts.query.safeParse(request.query);
  if (!parsed.success) {
    throw new AppError(
      400,
      'INVALID_REQUEST',
      'Enter a search keyword (1 to 100 characters).',
    );
  }
  const result = await searchPostsService(parsed.data.q);
  const body = SEARCH_CONTRACTS.posts.responseBody.parse(result);
  response.status(200).json(body);
}
