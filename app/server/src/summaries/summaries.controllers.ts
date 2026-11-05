import { AppError } from '../errors/app.error.js';
import { ErrorCode } from '../errors/error-code.js';
import { HttpStatus } from '../errors/http-status.js';
import type { ParamsRequest } from '../types/requests.js';
import {
  generateSummaryService,
  getSummaryService,
} from './summaries.services.js';
import {
  SUMMARIES_CONTRACTS,
  type GenerateSummaryResponse,
  type GetSummaryResponse,
  type SummaryPostIdParams,
} from '@summit/shared';
import type { Response } from 'express';

type SummaryParams = {
  postId: string;
};

function _parsePostId(request: ParamsRequest<SummaryParams>): number {
  const parsed = SUMMARIES_CONTRACTS.get.params.safeParse(request.params);
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_POST_ID,
      'Invalid post ID.',
    );
  }
  const params: SummaryPostIdParams = parsed.data;
  return params.postId;
}

export async function getSummaryController(
  request: ParamsRequest<SummaryParams>,
  response: Response<GetSummaryResponse>,
): Promise<void> {
  const postId = _parsePostId(request);
  const result = await getSummaryService(postId);
  const body = SUMMARIES_CONTRACTS.get.responseBody.parse(result);
  response.status(HttpStatus.OK).json(body);
}

export async function generateSummaryController(
  request: ParamsRequest<SummaryParams>,
  response: Response<GenerateSummaryResponse>,
): Promise<void> {
  const postId = _parsePostId(request);
  const result = await generateSummaryService(postId);
  const body = SUMMARIES_CONTRACTS.generate.responseBody.parse(result);
  response.status(HttpStatus.CREATED).json(body);
}
