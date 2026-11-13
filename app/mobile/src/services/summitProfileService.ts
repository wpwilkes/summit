import { getAuthToken } from '../utils/tokenStorage';

export type SummitProfile = {
  id: number;
  email: string;
  username: string;
  createdAt: string;
};

function getBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

  if (!baseUrl) {
    throw new Error(
      'The server address is missing. Set EXPO_PUBLIC_API_URL and restart Expo.',
    );
  }

  return baseUrl;
}

async function getToken(): Promise<string> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Please log out and sign in again.');
  }

  return token;
}

function parseProfile(data: unknown): SummitProfile {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('user' in data) ||
    typeof data.user !== 'object' ||
    data.user === null
  ) {
    throw new Error('The server returned an invalid profile.');
  }

  const user = data.user as Record<string, unknown>;

  if (
    typeof user.id !== 'number' ||
    !Number.isInteger(user.id) ||
    typeof user.username !== 'string' ||
    !user.username.trim() ||
    typeof user.email !== 'string' ||
    !user.email.trim() ||
    typeof user.createdAt !== 'string' ||
    !user.createdAt.trim()
  ) {
    throw new Error('The server returned an incomplete profile.');
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export async function getSummitProfile(
  signal?: AbortSignal,
): Promise<SummitProfile> {
  const baseUrl = getBaseUrl();
  const token = await getToken();

  const response = await fetch(`${baseUrl}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (response.status === 401) {
    throw new Error(
      'Your session has expired. Please log out and sign in again.',
    );
  }

  if (!response.ok) {
    throw new Error('Could not load your profile. Please try again.');
  }

  const data: unknown = await response.json();

  return parseProfile(data);
}

export async function updateSummitProfile(
  username: string,
  signal?: AbortSignal,
): Promise<SummitProfile> {
  const baseUrl = getBaseUrl();
  const token = await getToken();

  const response = await fetch(`${baseUrl}/api/auth/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
    }),
    signal,
  });

  if (response.status === 401) {
    throw new Error(
      'Your session has expired. Please log out and sign in again.',
    );
  }

  if (response.status === 409) {
    throw new Error('That username is already taken.');
  }

  if (response.status === 400) {
    throw new Error('Username must be between 3 and 30 characters.');
  }

  if (!response.ok) {
    throw new Error('Could not update your profile. Please try again.');
  }

  const data: unknown = await response.json();

  return parseProfile(data);
}

/*
 * Existing posts helper.
 * Keep this function so current post code continues working.
 */
export async function getPostsProfile(
  signal: AbortSignal,
): Promise<{ id: number; username: string }> {
  const profile = await getSummitProfile(signal);

  return {
    id: profile.id,
    username: profile.username,
  };
}

export async function getPostsUsername(
  signal: AbortSignal,
): Promise<string> {
  return (await getPostsProfile(signal)).username;
}