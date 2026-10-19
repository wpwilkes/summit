import { HTTP_METHOD } from "../common/http.js";
import { SUMMARY_PATHS } from "./summary.paths.js";
import {
  SummarizeRequestSchema,
  SummarizeResponseSchema,
} from "./summary.schemas.js";

export const SUMMARY_CONTRACTS = {
  summarize: {
    method: HTTP_METHOD.post,
    path: SUMMARY_PATHS.summarize,
    requestBody: SummarizeRequestSchema,
    responseBody: SummarizeResponseSchema,
  },
} as const;
