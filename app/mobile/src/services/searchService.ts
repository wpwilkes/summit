import {
  SEARCH_CONTRACTS,
  SEARCH_IMAGE_MAX_BYTES,
  SEARCH_IMAGE_MIME_TYPES,
  type SearchPostResult,
} from '@summit/shared';

import { getAuthToken } from '../utils/tokenStorage';

/*
 * SEARCH SERVICE
 *
 * Talks to the real backend search endpoint. The path, method and response
 * shape all come from the shared contract, so the app and the server can never
 * disagree about them.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Longest keyword the backend accepts. Keep this in sync with the shared schema.
export const MAX_SEARCH_LENGTH = 100;

// Give up if the server has not answered after this long.
const REQUEST_TIMEOUT_MS = 10000;

export type SearchPostsResult =
  | { success: true; query: string; posts: SearchPostResult[] }
  | { success: false; message: string };

/**
 * Check what the user typed before we ever call the server.
 * Returns an error message to show, or '' when the keyword is fine.
 */
export function validateSearchKeyword(input: string): string {
  const keyword = input.trim();
  if (!keyword) return 'Type something to search for.';
  if (keyword.length > MAX_SEARCH_LENGTH) {
    return `Search must be ${MAX_SEARCH_LENGTH} characters or fewer.`;
  }
  return '';
}

/** Search posts by keyword. Never throws: problems come back as a message. */
export async function searchPosts(input: string): Promise<SearchPostsResult> {
  const invalidMessage = validateSearchKeyword(input);
  if (invalidMessage) return { success: false, message: invalidMessage };

  if (!API_BASE_URL) {
    return { success: false, message: 'The Summit server address is not set.' };
  }

  const keyword = input.trim();
  const url = `${API_BASE_URL.replace(/\/$/, '')}${
    SEARCH_CONTRACTS.posts.path
  }?q=${encodeURIComponent(keyword)}`;

  // AbortController lets us cancel the request if the server is too slow.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: SEARCH_CONTRACTS.posts.method,
      signal: controller.signal,
    });
    const data: unknown = await response.json();

    if (!response.ok) {
      // The server sends errors as { error: { code, message } }.
      const message = (data as { error?: { message?: string } })?.error
        ?.message;
      return {
        success: false,
        message: message ?? 'Search failed. Please try again.',
      };
    }

    // Make sure the server really sent what the contract promises.
    const parsed = SEARCH_CONTRACTS.posts.responseBody.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Search failed. The server sent an unexpected response.',
      };
    }
    return { success: true, ...parsed.data };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    return {
      success: false,
      message: timedOut
        ? 'The search took too long. Please try again.'
        : 'Could not connect to the Summit server.',
    };
  } finally {
    clearTimeout(timer);
  }
}

// The AI needs longer to look at a picture than a text search takes.
const IMAGE_REQUEST_TIMEOUT_MS = 45000;

/** A picture the user took or chose, as returned by expo-image-picker. */
export type SearchImage = {
  uri: string;
  mimeType?: string;
};

export type SearchByImageResult =
  | {
      success: true;
      keywords: string[];
      posts: SearchPostResult[];
    }
  | { success: false; message: string };

function isAcceptedImageType(mime: string): boolean {
  return (SEARCH_IMAGE_MIME_TYPES as readonly string[]).includes(mime);
}

/**
 * Search posts with a picture. The server asks the AI what the picture shows,
 * then finds posts whose title, text or comments mention it.
 * Never throws: problems come back as a message.
 */
export async function searchPostsByImage(
  image: SearchImage,
): Promise<SearchByImageResult> {
  if (!API_BASE_URL) {
    return { success: false, message: 'The Summit server address is not set.' };
  }

  // The AI costs money, so the server only lets signed-in users do this.
  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: 'Log in to search with a picture.' };
  }

  // Read the picture from the device into memory.
  let file: Blob;
  try {
    const local = await fetch(image.uri);
    if (!local.ok) throw new Error('Could not read the picture.');
    file = await local.blob();
  } catch {
    return {
      success: false,
      message: 'Could not read this picture. Choose another one.',
    };
  }

  const mime = (image.mimeType || file.type || '').toLowerCase();
  if (!isAcceptedImageType(mime)) {
    return {
      success: false,
      message: 'Only JPEG, PNG and WebP pictures can be searched.',
    };
  }
  if (!file.size || file.size > SEARCH_IMAGE_MAX_BYTES) {
    return { success: false, message: 'The picture must be 5 MB or smaller.' };
  }

  const url = `${API_BASE_URL.replace(/\/$/, '')}${SEARCH_CONTRACTS.image.path}`;

  // AbortController lets us cancel the request if the server is too slow.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IMAGE_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: SEARCH_CONTRACTS.image.method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': mime,
      },
      body: file,
      signal: controller.signal,
    });
    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      // The server sends errors as { error: { code, message } }.
      const message = (data as { error?: { message?: string } })?.error
        ?.message;
      return {
        success: false,
        message: message ?? 'Search by picture failed. Please try again.',
      };
    }

    // Make sure the server really sent what the contract promises.
    const parsed = SEARCH_CONTRACTS.image.responseBody.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Search failed. The server sent an unexpected response.',
      };
    }
    return { success: true, ...parsed.data };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    return {
      success: false,
      message: timedOut
        ? 'Looking at the picture took too long. Please try again.'
        : 'Could not connect to the Summit server.',
    };
  } finally {
    clearTimeout(timer);
  }
}
