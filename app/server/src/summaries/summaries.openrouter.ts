import { getOpenRouterApiKey, getOpenRouterModel } from '../config/llm.js';
import { AppError } from '../errors/app.error.js';
import { ErrorCode } from '../errors/error-code.js';
import { HttpStatus } from '../errors/http-status.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Stop waiting for the AI after this long.
const REQUEST_TIMEOUT_MS = 20000;

// A summary only needs a few sentences, so this keeps the cost low.
const MAX_OUTPUT_TOKENS = 400;

export type ChatMessage = {
  role: 'system' | 'user';
  content: string;
};

type OpenRouterResponse = {
  choices?: { message?: { content?: unknown } }[];
};

// Send the messages to OpenRouter and return the text the AI wrote back.
// Every problem is turned into an AppError so the API answers with a clear
// message instead of a crash.
export async function askOpenRouter(messages: ChatMessage[]): Promise<string> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    throw new AppError(
      HttpStatus.SERVICE_UNAVAILABLE,
      ErrorCode.SUMMARY_UNAVAILABLE,
      'AI summaries are not set up on this server.',
    );
  }

  // AbortController lets us cancel the request if OpenRouter is too slow.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: getOpenRouterModel(),
        messages,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AppError(
        HttpStatus.BAD_GATEWAY,
        ErrorCode.SUMMARY_FAILED,
        'The AI service could not create a summary. Please try again.',
      );
    }

    const data = (await response.json()) as OpenRouterResponse;
    const text = data.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) {
      throw new AppError(
        HttpStatus.BAD_GATEWAY,
        ErrorCode.SUMMARY_FAILED,
        'The AI service sent back an empty summary. Please try again.',
      );
    }
    return text.trim();
  } catch (error) {
    // Errors we created above are already friendly, pass them on as they are.
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AppError(
        HttpStatus.GATEWAY_TIMEOUT,
        ErrorCode.SUMMARY_TIMEOUT,
        'The AI service took too long. Please try again.',
      );
    }
    throw new AppError(
      HttpStatus.BAD_GATEWAY,
      ErrorCode.SUMMARY_FAILED,
      'Could not reach the AI service. Please try again.',
    );
  } finally {
    clearTimeout(timer);
  }
}
