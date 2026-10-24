import { getAuthToken } from '../utils/tokenStorage';

/** Read the existing profile endpoint; Khan's login flow stays unchanged. */
export async function getPostsUsername(signal: AbortSignal): Promise<string> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!baseUrl)
    throw new Error(
      'The server address is missing. Set EXPO_PUBLIC_API_URL and restart Expo.',
    );
  const token = await getAuthToken();
  if (!token) throw new Error('Please log out and sign in again.');
  const response = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  if (response.status === 401)
    throw new Error(
      'Your session has expired. Please log out and sign in again.',
    );
  if (!response.ok)
    throw new Error('Could not load your profile. Please try again.');
  const data: { user?: { username?: unknown } } = await response.json();
  if (typeof data.user?.username !== 'string' || !data.user.username.trim()) {
    throw new Error(
      'Your profile did not include a username. Please try again.',
    );
  }
  return data.user.username;
}
