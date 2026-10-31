import {
  COMMUNITIES_CONTRACTS,
  type Community,
  type CreateCommunityRequest,
  type Post,
} from '@summit/shared';

import {
  getAuthToken,
} from '../utils/tokenStorage';

/*
 * COMMUNITY SERVICE
 *
 * Connects the mobile application to the
 * Summit community backend.
 *
 * Request methods, paths, request shapes,
 * and response shapes come from the
 * shared community contracts.
 */

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL;

const REQUEST_TIMEOUT_MS = 10000;

type BackendErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
};

export type GetCommunitiesResult =
  | {
      success: true;
      communities: Community[];
    }
  | {
      success: false;
      message: string;
    };

export type GetCommunityResult =
  | {
      success: true;
      community: Community;
    }
  | {
      success: false;
      message: string;
    };

export type GetCommunityPostsResult =
  | {
      success: true;
      posts: Post[];
    }
  | {
      success: false;
      message: string;
    };

export type CreateCommunityResult =
  | {
      success: true;
      community: Community;
    }
  | {
      success: false;
      message: string;
    };

export type GetJoinedCommunitiesResult =
  | {
      success: true;
      communities: Community[];
    }
  | {
      success: false;
      message: string;
    };

export type CommunityMembershipResult =
  | {
      success: true;
      communityId: number;
      joined: boolean;
    }
  | {
      success: false;
      message: string;
    };

function getApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is not configured.',
    );
  }

  return API_BASE_URL.replace(/\/$/, '');
}

function getBackendErrorMessage(
  data: unknown,
  fallbackMessage: string,
): string {
  const errorData =
    data as BackendErrorResponse;

  if (errorData?.error?.message) {
    return errorData.error.message;
  }

  if (errorData?.message) {
    return errorData.message;
  }

  return fallbackMessage;
}

function createRequestController() {
  const controller =
    new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  return {
    controller,
    timer,
  };
}

/*
 * GET ALL COMMUNITIES
 *
 * Public endpoint.
 */
export async function getCommunities(): Promise<
  GetCommunitiesResult
> {
  const {
    controller,
    timer,
  } = createRequestController();

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${COMMUNITIES_CONTRACTS.getAll.path}`,
      {
        method:
          COMMUNITIES_CONTRACTS.getAll.method,
        signal: controller.signal,
      },
    );

    const responseData: unknown =
      await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          getBackendErrorMessage(
            responseData,
            'Unable to load communities.',
          ),
      };
    }

    const parsedResponse =
      COMMUNITIES_CONTRACTS.getAll.responseBody.safeParse(
        responseData,
      );

    if (!parsedResponse.success) {
      console.error(
        'Invalid communities response:',
        parsedResponse.error,
      );

      return {
        success: false,
        message:
          'Unable to load communities. The server sent an unexpected response.',
      };
    }

    return {
      success: true,
      communities:
        parsedResponse.data.communities,
    };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      error.name === 'AbortError';

    console.error(
      'Get communities request failed:',
      error,
    );

    return {
      success: false,
      message: timedOut
        ? 'The request took too long. Please try again.'
        : 'Could not connect to the Summit server.',
    };
  } finally {
    clearTimeout(timer);
  }
}

/*
 * GET ONE COMMUNITY
 *
 * The backend identifies a community
 * using its name.
 */
export async function getCommunity(
  communityName: string,
): Promise<GetCommunityResult> {
  const {
    controller,
    timer,
  } = createRequestController();

  const path =
    COMMUNITIES_CONTRACTS.getByName.path.replace(
      ':name',
      encodeURIComponent(
        communityName,
      ),
    );

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${path}`,
      {
        method:
          COMMUNITIES_CONTRACTS.getByName.method,
        signal: controller.signal,
      },
    );

    const responseData: unknown =
      await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          getBackendErrorMessage(
            responseData,
            'Unable to load this community.',
          ),
      };
    }

    const parsedResponse =
      COMMUNITIES_CONTRACTS.getByName.responseBody.safeParse(
        responseData,
      );

    if (!parsedResponse.success) {
      console.error(
        'Invalid community response:',
        parsedResponse.error,
      );

      return {
        success: false,
        message:
          'Unable to load this community. The server sent an unexpected response.',
      };
    }

    return {
      success: true,
      community:
        parsedResponse.data.community,
    };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      error.name === 'AbortError';

    console.error(
      'Get community request failed:',
      error,
    );

    return {
      success: false,
      message: timedOut
        ? 'The request took too long. Please try again.'
        : 'Could not connect to the Summit server.',
    };
  } finally {
    clearTimeout(timer);
  }
}

/*
 * GET COMMUNITY POSTS
 */
export async function getCommunityPosts(
  communityName: string,
): Promise<GetCommunityPostsResult> {
  const {
    controller,
    timer,
  } = createRequestController();

  const path =
    COMMUNITIES_CONTRACTS.getPosts.path.replace(
      ':name',
      encodeURIComponent(
        communityName,
      ),
    );

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${path}`,
      {
        method:
          COMMUNITIES_CONTRACTS.getPosts.method,
        signal: controller.signal,
      },
    );

    const responseData: unknown =
      await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          getBackendErrorMessage(
            responseData,
            'Unable to load community posts.',
          ),
      };
    }

    const parsedResponse =
      COMMUNITIES_CONTRACTS.getPosts.responseBody.safeParse(
        responseData,
      );

    if (!parsedResponse.success) {
      console.error(
        'Invalid community posts response:',
        parsedResponse.error,
      );

      return {
        success: false,
        message:
          'Unable to load community posts. The server sent an unexpected response.',
      };
    }

    return {
      success: true,
      posts:
        parsedResponse.data.posts,
    };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      error.name === 'AbortError';

    console.error(
      'Get community posts request failed:',
      error,
    );

    return {
      success: false,
      message: timedOut
        ? 'The request took too long. Please try again.'
        : 'Could not connect to the Summit server.',
    };
  } finally {
    clearTimeout(timer);
  }
}

/*
 * CREATE COMMUNITY
 *
 * This is a protected endpoint.
 * The JWT stored after login is sent in
 * the Authorization header.
 */
export async function createCommunity(
  data: CreateCommunityRequest,
): Promise<CreateCommunityResult> {
  const token =
    await getAuthToken();

  if (!token) {
    return {
      success: false,
      message:
        'You must be logged in to create a community.',
    };
  }

  const parsedRequest =
    COMMUNITIES_CONTRACTS.create.requestBody.safeParse(
      data,
    );

  if (!parsedRequest.success) {
    return {
      success: false,
      message:
        'Please enter valid community information.',
    };
  }

  const {
    controller,
    timer,
  } = createRequestController();

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${COMMUNITIES_CONTRACTS.create.path}`,
      {
        method:
          COMMUNITIES_CONTRACTS.create.method,

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify(
          parsedRequest.data,
        ),

        signal:
          controller.signal,
      },
    );

    const responseData: unknown =
      await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          getBackendErrorMessage(
            responseData,
            'Unable to create the community.',
          ),
      };
    }

    const parsedResponse =
      COMMUNITIES_CONTRACTS.create.responseBody.safeParse(
        responseData,
      );

    if (!parsedResponse.success) {
      console.error(
        'Invalid create community response:',
        parsedResponse.error,
      );

      return {
        success: false,
        message:
          'Unable to create the community. The server sent an unexpected response.',
      };
    }

    return {
      success: true,
      community:
        parsedResponse.data.community,
    };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      error.name === 'AbortError';

    console.error(
      'Create community request failed:',
      error,
    );

    return {
      success: false,
      message: timedOut
        ? 'The request took too long. Please try again.'
        : 'Could not connect to the Summit server.',
    };
  } finally {
    clearTimeout(timer);
  }
}

/*
 * GET JOINED COMMUNITIES
 *
 * Returns the communities joined by
 * the currently logged-in user.
 */
export async function getJoinedCommunities(): Promise<
  GetJoinedCommunitiesResult
> {
  const token =
    await getAuthToken();

  if (!token) {
    return {
      success: false,
      message:
        'You must be logged in to view joined communities.',
    };
  }

  const {
    controller,
    timer,
  } = createRequestController();

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${COMMUNITIES_CONTRACTS.getJoined.path}`,
      {
        method:
          COMMUNITIES_CONTRACTS.getJoined.method,

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        signal:
          controller.signal,
      },
    );

    const responseData: unknown =
      await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          getBackendErrorMessage(
            responseData,
            'Unable to load joined communities.',
          ),
      };
    }

    const parsedResponse =
      COMMUNITIES_CONTRACTS.getJoined.responseBody.safeParse(
        responseData,
      );

    if (!parsedResponse.success) {
      console.error(
        'Invalid joined communities response:',
        parsedResponse.error,
      );

      return {
        success: false,
        message:
          'Unable to load joined communities. The server sent an unexpected response.',
      };
    }

    return {
      success: true,
      communities:
        parsedResponse.data.communities,
    };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      error.name === 'AbortError';

    console.error(
      'Get joined communities request failed:',
      error,
    );

    return {
      success: false,
      message: timedOut
        ? 'The request took too long. Please try again.'
        : 'Could not connect to the Summit server.',
    };
  } finally {
    clearTimeout(timer);
  }
}

/*
 * JOIN COMMUNITY
 *
 * Adds the logged-in user to the
 * selected community.
 */
export async function joinCommunity(
  communityName: string,
): Promise<CommunityMembershipResult> {
  const token =
    await getAuthToken();

  if (!token) {
    return {
      success: false,
      message:
        'You must be logged in to join a community.',
    };
  }

  const {
    controller,
    timer,
  } = createRequestController();

  const path =
    COMMUNITIES_CONTRACTS.join.path.replace(
      ':name',
      encodeURIComponent(
        communityName,
      ),
    );

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${path}`,
      {
        method:
          COMMUNITIES_CONTRACTS.join.method,

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        signal:
          controller.signal,
      },
    );

    const responseData: unknown =
      await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          getBackendErrorMessage(
            responseData,
            'Unable to join the community.',
          ),
      };
    }

    const parsedResponse =
      COMMUNITIES_CONTRACTS.join.responseBody.safeParse(
        responseData,
      );

    if (!parsedResponse.success) {
      console.error(
        'Invalid join community response:',
        parsedResponse.error,
      );

      return {
        success: false,
        message:
          'Unable to join the community. The server sent an unexpected response.',
      };
    }

    return {
      success: true,
      communityId:
        parsedResponse.data.communityId,
      joined:
        parsedResponse.data.joined,
    };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      error.name === 'AbortError';

    console.error(
      'Join community request failed:',
      error,
    );

    return {
      success: false,
      message: timedOut
        ? 'The request took too long. Please try again.'
        : 'Could not connect to the Summit server.',
    };
  } finally {
    clearTimeout(timer);
  }
}

/*
 * LEAVE COMMUNITY
 *
 * Removes the logged-in user from the
 * selected community.
 */
export async function leaveCommunity(
  communityName: string,
): Promise<CommunityMembershipResult> {
  const token =
    await getAuthToken();

  if (!token) {
    return {
      success: false,
      message:
        'You must be logged in to leave a community.',
    };
  }

  const {
    controller,
    timer,
  } = createRequestController();

  const path =
    COMMUNITIES_CONTRACTS.leave.path.replace(
      ':name',
      encodeURIComponent(
        communityName,
      ),
    );

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${path}`,
      {
        method:
          COMMUNITIES_CONTRACTS.leave.method,

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        signal:
          controller.signal,
      },
    );

    const responseData: unknown =
      await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          getBackendErrorMessage(
            responseData,
            'Unable to leave the community.',
          ),
      };
    }

    const parsedResponse =
      COMMUNITIES_CONTRACTS.leave.responseBody.safeParse(
        responseData,
      );

    if (!parsedResponse.success) {
      console.error(
        'Invalid leave community response:',
        parsedResponse.error,
      );

      return {
        success: false,
        message:
          'Unable to leave the community. The server sent an unexpected response.',
      };
    }

    return {
      success: true,
      communityId:
        parsedResponse.data.communityId,
      joined:
        parsedResponse.data.joined,
    };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      error.name === 'AbortError';

    console.error(
      'Leave community request failed:',
      error,
    );

    return {
      success: false,
      message: timedOut
        ? 'The request took too long. Please try again.'
        : 'Could not connect to the Summit server.',
    };
  } finally {
    clearTimeout(timer);
  }
}