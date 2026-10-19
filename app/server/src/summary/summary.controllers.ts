import { summarizeService } from './summary.services.js';
import {
  SUMMARY_CONTRACTS,
  type SummarizeRequest,
  type SummarizeResponse,
} from '@summit/shared';
import type { Request, Response } from 'express';

type BodyRequest<T> = Request<Record<string, never>, unknown, T>;

type ErrorResponse = {
  error: string;
};

export function summarizeController(
  request: BodyRequest<SummarizeRequest>,
  response: Response<SummarizeResponse | ErrorResponse>,
): void {
  const parsed = SUMMARY_CONTRACTS.summarize.requestBody.safeParse(
    request.body,
  );
  if (!parsed.success) {
    response.status(400).json({
      error: 'Invalid summarize request. Failed to parse.',
    });
    return;
  }
  try {
    const result = SUMMARY_CONTRACTS.summarize.responseBody.parse({
      summary: summarizeService(parsed.data),
    });
    response.status(200).json(result);
  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: 'Summarize error: service failed.',
    });
  }
}
