import { getOpenRouterModel } from '../config/llm.js';
import { AppError } from '../errors/app.error.js';
import { ErrorCode } from '../errors/error-code.js';
import { HttpStatus } from '../errors/http-status.js';
import {
  callOpenRouter,
  OpenRouterError,
  type ChatMessage,
  type OpenRouterFailure,
} from '../lib/openrouter.js';

export type { ChatMessage } from '../lib/openrouter.js';

// Stop waiting for the AI after this long.
const REQUEST_TIMEOUT_MS = 20000;

// A summary only needs a few sentences, so this keeps the cost low.
const MAX_OUTPUT_TOKENS = 400;

// What the user sees for each way the AI call can fail.
function toSummaryError(failure: OpenRouterFailure): AppError {
  switch (failure) {
    case 'not-configured':
      return new AppError(
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.SUMMARY_UNAVAILABLE,
        'AI summaries are not set up on this server.',
      );
    case 'bad-response':
      return new AppError(
        HttpStatus.BAD_GATEWAY,
        ErrorCode.SUMMARY_FAILED,
        'The AI service could not create a summary. Please try again.',
      );
    case 'empty':
      return new AppError(
        HttpStatus.BAD_GATEWAY,
        ErrorCode.SUMMARY_FAILED,
        'The AI service sent back an empty summary. Please try again.',
      );
    case 'timeout':
      return new AppError(
        HttpStatus.GATEWAY_TIMEOUT,
        ErrorCode.SUMMARY_TIMEOUT,
        'The AI service took too long. Please try again.',
      );
    case 'unreachable':
      return new AppError(
        HttpStatus.BAD_GATEWAY,
        ErrorCode.SUMMARY_FAILED,
        'Could not reach the AI service. Please try again.',
      );
  }
}

// Send the messages to OpenRouter and return the text the AI wrote back.
// Every problem is turned into an AppError so the API answers with a clear
// message instead of a crash.
export async function askOpenRouter(messages: ChatMessage[]): Promise<string> {
  try {
    return await callOpenRouter({
      model: getOpenRouterModel(),
      messages,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      timeoutMs: REQUEST_TIMEOUT_MS,
      temperature: 0.3,
    });
  } catch (error) {
    if (error instanceof OpenRouterError) {
      throw toSummaryError(error.failure);
    }
    throw error;
  }
}
