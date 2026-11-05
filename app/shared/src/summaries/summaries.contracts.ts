import { HTTP_METHOD } from '../common/http.js';
import { SUMMARIES_PATHS } from './summaries.paths.js';
import {
  GenerateSummaryRequestSchema,
  GenerateSummaryResponseSchema,
  GetSummaryRequestSchema,
  GetSummaryResponseSchema,
  SummaryPostIdParamsSchema,
} from './summaries.schemas.js';

export const SUMMARIES_CONTRACTS = {
  get: {
    method: HTTP_METHOD.get,
    path: SUMMARIES_PATHS.get,
    params: SummaryPostIdParamsSchema,
    requestBody: GetSummaryRequestSchema,
    responseBody: GetSummaryResponseSchema,
  },
  generate: {
    method: HTTP_METHOD.post,
    path: SUMMARIES_PATHS.generate,
    params: SummaryPostIdParamsSchema,
    requestBody: GenerateSummaryRequestSchema,
    responseBody: GenerateSummaryResponseSchema,
  },
} as const;
