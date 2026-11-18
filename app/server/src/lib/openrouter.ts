import { getOpenRouterApiKey } from '../config/llm.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// A message can be plain text, or a list of parts when it carries an image.
export type ChatContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export type ChatMessage = {
  role: 'system' | 'user';
  content: string | ChatContentPart[];
};

export type OpenRouterRequest = {
  model: string;
  messages: ChatMessage[];
  maxOutputTokens: number;
  timeoutMs: number;
  temperature: number;
  // Ask the model to answer straight away instead of "thinking" first.
  // Thinking is slow and uses up output tokens on short answers.
  skipReasoning?: boolean;
};

// Why a call to OpenRouter did not give us text back:
//   not-configured - no API key on this server
//   bad-response   - OpenRouter answered with an error status
//   empty          - OpenRouter answered, but with no text
//   timeout        - it took longer than timeoutMs
//   unreachable    - the network request itself failed
export type OpenRouterFailure =
  'not-configured' | 'bad-response' | 'empty' | 'timeout' | 'unreachable';

// Each feature turns this into its own friendly AppError.
export class OpenRouterError extends Error {
  constructor(public readonly failure: OpenRouterFailure) {
    super(`OpenRouter request failed: ${failure}`);
    this.name = 'OpenRouterError';
  }
}

type OpenRouterResponse = {
  choices?: { message?: { content?: unknown } }[];
};

// Send the messages to OpenRouter and return the text the AI wrote back.
export async function callOpenRouter(
  request: OpenRouterRequest,
): Promise<string> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    throw new OpenRouterError('not-configured');
  }

  // AbortController lets us cancel the request if OpenRouter is too slow.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), request.timeoutMs);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        max_tokens: request.maxOutputTokens,
        temperature: request.temperature,
        ...(request.skipReasoning ? { reasoning: { enabled: false } } : {}),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new OpenRouterError('bad-response');
    }

    const data = (await response.json()) as OpenRouterResponse;
    const text = data.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) {
      throw new OpenRouterError('empty');
    }
    return text.trim();
  } catch (error) {
    if (error instanceof OpenRouterError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new OpenRouterError('timeout');
    }
    throw new OpenRouterError('unreachable');
  } finally {
    clearTimeout(timer);
  }
}
