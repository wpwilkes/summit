// The model used when OPENROUTER_MODEL is not set in the .env file.
const DEFAULT_OPENROUTER_MODEL = 'google/gemini-2.5-flash-lite';

// Returns the OpenRouter API key, or undefined when it has not been set.
// We do not throw here: a missing key should only switch the AI summary off,
// not stop the whole server from starting.
export function getOpenRouterApiKey(): string | undefined {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  return apiKey ? apiKey : undefined;
}

export function getOpenRouterModel(): string {
  return process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
}
