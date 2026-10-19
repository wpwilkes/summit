const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type SummarizeInput = {
  title: string;
  description: string;
  comments?: string[];
};

// asks the backend to summarize a post and its comments
export async function summarizePost(input: SummarizeInput): Promise<string> {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }

  // only send comments when there are some
  const payload = {
    title: input.title,
    description: input.description,
    ...(input.comments?.length ? { comments: input.comments } : {}),
  };

  const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // an error page from the server or tunnel is not JSON, so don't let it crash
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? 'The server is not responding. Please try again.');
  }

  if (typeof data?.summary !== 'string') {
    throw new Error('The server sent back something we could not read.');
  }

  return data.summary;
}
