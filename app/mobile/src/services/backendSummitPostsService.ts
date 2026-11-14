/** Network-backed Posts workspace. The old in-memory service remains intact for its tests. */

import {
  COMMENTS_CONTRACTS,
  COMMUNITIES_CONTRACTS,
  POSTS_CONTRACTS,
  POSTS_PATHS,
  SUMMARIES_CONTRACTS,
  type Comment,
  type Post,
  type Community,
  type Summary,
  type CreatePostResponse,
  type CreateCommentResponse,
  type CreateReplyResponse,
} from '@summit/shared';

import { getAuthToken } from '../utils/tokenStorage';

import type {
  PostInput,
  PostPhoto,
  PostSummary,
  SummitPost,
  SummitComment,
  Vote,
} from '../types/summitPost.types';

import { validatePost } from './summitPostsService';

export type PostsProfile = { id: number; username: string };

function baseUrl(): string {
  const value = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

  if (!value) {
    throw new Error(
      'Set EXPO_PUBLIC_API_URL to the server address and restart Expo.',
    );
  }

  return value;
}

function endpoint(template: string, id: string): string {
  return template.replace(/:postId|:commentId/g, encodeURIComponent(id));
}

async function request<T>(
  path: string,
  method = 'GET',
  data?: unknown,
): Promise<T> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  let response: Response;

  try {
    response = await fetch(`${baseUrl()}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(data === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
  } catch {
    throw new Error(
      'Could not reach the Summit server. Check the laptop IP address and network.',
    );
  }

  const result: any = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = result.error;

    throw new Error(
      (typeof detail === 'object' && detail?.message) ||
        (typeof detail === 'string' && detail) ||
        result.message ||
        `Server returned HTTP ${response.status}.`,
    );
  }

  return result as T;
}

async function uploadPhoto(photo: PostPhoto): Promise<string> {
  const mime = photo.mimeType ?? 'image/jpeg';

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) {
    throw new Error('Only JPEG, PNG, and WebP images can be uploaded.');
  }

  const token = await getAuthToken();

  if (!token) {
    throw new Error('Please sign in again.');
  }

  let blob: Blob;

  try {
    const file = await fetch(photo.uri);

    if (!file.ok) {
      throw new Error('Unable to read selected photo.');
    }

    blob = await file.blob();
  } catch {
    throw new Error(
      'Could not read this photo on your device. Choose another image.',
    );
  }

  if (!blob.size || blob.size > 5 * 1024 * 1024) {
    throw new Error('Photo must be smaller than 5 MB.');
  }

  const response = await fetch(`${baseUrl()}${POSTS_PATHS.uploadImage}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': mime,
    },
    body: blob,
  });

  const result: {
    photoUrl?: string;
    error?: { message?: string };
  } = await response.json().catch(() => ({}));

  if (!response.ok || !result.photoUrl) {
    throw new Error(result.error?.message ?? 'Photo upload failed.');
  }

  return result.photoUrl;
}

export function createBackendSummitPostsService(profile: PostsProfile) {
  const posts = new Map<string, SummitPost>();
  const comments = new Map<string, SummitComment[]>();
  let communities: Community[] = [];

  const postVotes = new Map<string, Vote>();
  const commentVotes = new Map<string, Vote>();


  const pendingVotes = new Map<string, Promise<void>>();
  let voteRevision = 0;
  const postVoteRevisions = new Map<string, number>();

  function runVote(
    key: string,
    action: () => Promise<void>,
  ): Promise<void> {
    const pending = pendingVotes.get(key);

    if (pending) {
      return pending;
    }

    const task = action().finally(() => {
      pendingVotes.delete(key);
    });

    pendingVotes.set(key, task);

    return task;
  }

  async function sendPostVote(id: string, value: -1 | 1) {
    if (value !== -1 && value !== 1) {
      throw new Error('Vote must be 1 or -1.');
    }

    const contract = POSTS_CONTRACTS;

    // Read the current user's server vote before toggling. A stale local cache
    // (or a failed feed vote lookup) must not turn "remove vote" into "upvote".
    const before = contract.getVote.responseBody.safeParse(
      await request<unknown>(
        endpoint(contract.getVote.path, id),
        contract.getVote.method,
      ),
    );

    if (!before.success) {
      throw new Error('The server returned an invalid vote. Try again.');
    }

    const selected: Vote =
      before.data.userVote === value ? 0 : value;

    // request() above performs fetch with Bearer authentication and JSON data,
    // following the same request pattern as authService.ts.
    const result = contract.vote.responseBody.safeParse(
      await request<unknown>(
        endpoint(contract.vote.path, id),
        contract.vote.method,
        { value: selected },
      ),
    );

    if (!result.success) {
      throw new Error(
        'The server returned an invalid vote. Refresh and try again.',
      );
    }

    return result.data;
  }

  const validVote = (value: unknown): Vote =>
    value === -1 || value === 1 ? value : 0;

  const toPhoto = (post: Post): PostPhoto | undefined =>
    post.photoUrl
      ? {
          uri: `${baseUrl()}${post.photoUrl}`,
          width: post.photoWidth ?? 1,
          height: post.photoHeight ?? 1,
        }
      : undefined;

  const toPost = (post: Post): SummitPost => ({
    id: String(post.id),
    body: typeof post.body === 'string' ? post.body : '',
    community:
      typeof post.communityName === 'string'
        ? post.communityName
        : (communities.find((community) => community.id === post.communityId)
            ?.name ?? 'unknown'),
    photo: toPhoto(post),
    author: post.isAnonymous
      ? 'Anonymous'
      : (post.authorUsername?.trim() || 'Unknown user'),
    isOwner: post.isOwner === true ||
      (post.authorId !== undefined && post.authorId === profile.id),
    isAnonymous: post.isAnonymous === true,
    createdAt: post.createdAt,
    updatedAt: post.createdAt,
    voteCount: post.votes,
    userVote: postVotes.get(String(post.id)) ?? 0,
    commentCount: post.commentCount ?? 0,
  });

  const toComment = (comment: Comment): SummitComment => ({
    id: String(comment.id),
    postId: String(comment.postId),

    // Needed so the mobile discussion can place replies
    // underneath their parent comments.
    parentId:
      comment.parentId === null
        ? null
        : String(comment.parentId),

    body: comment.body ?? '',
    author: comment.isAnonymous
      ? 'Anonymous'
      : (comment.authorUsername?.trim() || 'Unknown user'),
    isOwner: !comment.deleted &&
      (comment.isOwner === true ||
        (comment.authorId !== undefined && comment.authorId === profile.id)),
    isAnonymous: comment.isAnonymous === true,
    createdAt: comment.createdAt,
    updatedAt: comment.createdAt,
    voteCount: comment.votes,
    userVote:
      commentVotes.get(String(comment.id)) ??
      0,
  });

  const toSummary = (summary: Summary): PostSummary => ({
    text: summary.summary,
    commentCount: summary.commentCount,
    createdAt: summary.createdAt,
  });

  async function loadCommunities() {
    const data = await request<{
      communities: Community[];
    }>(COMMUNITIES_CONTRACTS.getAll.path);

    communities = data.communities;
  }

  async function ensureCommunity(name: string): Promise<number> {
    await loadCommunities();

    let community = communities.find(
      (item) =>
        item.name.toLowerCase() ===
        name.toLowerCase(),
    );

    if (!community) {
      // The fixed original picker may reference a community
      // not yet created in a fresh DB.
      try {
        const created = await request<{
          community: Community;
        }>(
          COMMUNITIES_CONTRACTS.create.path,
          'POST',
          {
            name,
            description: '',
          },
        );

        community = created.community;
      } catch (error) {
        // Another user may have created it concurrently.
        await loadCommunities();

        community = communities.find(
          (item) =>
            item.name.toLowerCase() ===
            name.toLowerCase(),
        );

        if (!community) {
          throw error;
        }
      }
    }

    return community.id;
  }

  async function refreshPostVotes(
    items: Post[],
    startedRevision: number,
  ) {
    const groupSize = 8;

    for (
      let index = 0;
      index < items.length;
      index += groupSize
    ) {
      await Promise.all(
        items
          .slice(index, index + groupSize)
          .map(async (post) => {
            try {
              const data = await request<{
                userVote: Vote;
              }>(
                endpoint(
                  POSTS_CONTRACTS.getVote.path,
                  String(post.id),
                ),
              );

              if (
                (postVoteRevisions.get(
                  String(post.id),
                ) ?? 0) <= startedRevision
              ) {
                postVotes.set(
                  String(post.id),
                  validVote(data.userVote),
                );
              }
            } catch {
              /* Public feed remains usable if individual vote lookups fail. */
            }
          }),
      );
    }
  }

  return {
    getDisplayWarning(): string {
      return '';
    },

    list(): SummitPost[] {
      return [...posts.values()];
    },

    get(id: string): SummitPost | undefined {
      return posts.get(id);
    },

    comments(id: string): SummitComment[] {
      return comments.get(id) ?? [];
    },

    async load(): Promise<void> {
      const startedRevision = voteRevision;

      const [all] = await Promise.all([
        request<{ posts: Post[] }>(
          POSTS_CONTRACTS.getAll.path,
        ),
        loadCommunities(),
      ]);

      await refreshPostVotes(
        all.posts,
        startedRevision,
      );

      const updated = all.posts.map(
        (post) => {
          const item = toPost(post);
          const current = posts.get(item.id);

          // A background refresh started before a successful vote
          // must not overwrite the newer score returned by that vote request.
          return current &&
            (postVoteRevisions.get(
              item.id,
            ) ?? 0) > startedRevision
            ? {
                ...item,
                userVote:
                  current.userVote,
                voteCount:
                  current.voteCount,
              }
            : item;
        },
      );

      posts.clear();

      for (const post of updated) {
        posts.set(post.id, post);
      }
    },

    async loadComments(id: string): Promise<void> {

      const data = await request<{
        comments: Comment[];
      }>(
        endpoint(
          COMMENTS_CONTRACTS.getAllForPost.path,
          id,
        ),
      );

      const active = data.comments.filter(
        (comment) => !comment.deleted,
      );

      await Promise.all(
        active.map(async (comment) => {
          try {
            const vote = await request<{
              userVote: Vote;
            }>(
              endpoint(
                COMMENTS_CONTRACTS.getVote.path,
                String(comment.id),
              ),
            );

            commentVotes.set(
              String(comment.id),
              validVote(vote.userVote),
            );
          } catch {
            /* Keep comments readable if votes are temporarily unavailable. */
          }
        }),
      );

      comments.set(
        id,
        active.map(toComment),
      );
    },

    /** The last saved AI summary of a post, or null if it has none yet. */
    async summary(
      id: string,
    ): Promise<PostSummary | null> {
      const data = await request<{
        summary: Summary | null;
      }>(
        endpoint(
          SUMMARIES_CONTRACTS.get.path,
          id,
        ),
      );

      return data.summary
        ? toSummary(data.summary)
        : null;
    },

    /** Ask the server to write a new summary from the post and comments as they are now. */
    async generateSummary(
      id: string,
    ): Promise<PostSummary> {
      const data = await request<{
        summary: Summary;
      }>(
        endpoint(
          SUMMARIES_CONTRACTS.generate.path,
          id,
        ),
        'POST',
      );

      return toSummary(data.summary);
    },

    async create(
      input: PostInput,
    ): Promise<void> {
      const fields =
        validatePost(input);

      const communityId =
        await ensureCommunity(
          fields.community,
        );

      const photoUrl =
        fields.photo
          ? await uploadPhoto(
              fields.photo,
            )
          : undefined;

      const title =
        fields.body
          .slice(0, 160)
          .trim() || 'Photo';

      await request<CreatePostResponse>(
          POSTS_CONTRACTS.create.path,
          'POST',
          {
            communityId,
            title,
            body: fields.body,
            isAnonymous: input.isAnonymous === true,

            ...(photoUrl
              ? {
                  photoUrl,
                  photoWidth:
                    fields.photo
                      ?.width,
                  photoHeight:
                    fields.photo
                      ?.height,
                }
              : {}),
          },
        );

      await this.load();
    },

    async update(
      id: string,
      input: PostInput,
    ): Promise<void> {
      const fields =
        validatePost(input);

      const existing =
        posts.get(id);

      if (!existing?.isOwner) {
        throw new Error(
          'You can only edit your own post.',
        );
      }

      const communityId =
        await ensureCommunity(
          fields.community,
        );

      const originalPhoto =
        existing.photo;

      let photoUrl:
        | string
        | null = null;

      if (fields.photo) {
        photoUrl =
          originalPhoto &&
          originalPhoto.uri ===
            fields.photo.uri
            ? originalPhoto.uri.slice(
                baseUrl().length,
              )
            : await uploadPhoto(
                fields.photo,
              );
      }

      await request(
        endpoint(
          POSTS_CONTRACTS.update.path,
          id,
        ),
        'PATCH',
        {
          title:
            fields.body
              .slice(0, 160)
              .trim() || 'Photo',
          body: fields.body,
          communityId,
          isAnonymous: input.isAnonymous ?? existing.isAnonymous ?? false,
          photoUrl,
          photoWidth:
            fields.photo?.width ??
            null,
          photoHeight:
            fields.photo?.height ??
            null,
        },
      );

      await this.load();
    },

    async remove(
      id: string,
    ): Promise<void> {
      await request(
        endpoint(
          POSTS_CONTRACTS.remove.path,
          id,
        ),
        'DELETE',
      );

      posts.delete(id);
      comments.delete(id);

      await this.load();
    },

    vote(
      id: string,
      value: -1 | 1,
    ): Promise<void> {
      return runVote(
        `post:${id}`,
        async () => {
          const data =
            await sendPostVote(
              id,
              value,
            );

          postVoteRevisions.set(
            id,
            ++voteRevision,
          );

          postVotes.set(
            id,
            data.userVote,
          );

          const current =
            posts.get(id);

          if (current) {
            posts.set(id, {
              ...current,
              userVote:
                data.userVote,
              voteCount:
                data.votes,
            });
          }
        },
      );
    },

    async comment(
      id: string,
      body: string,
      isAnonymous = false,
    ): Promise<void> {
      await request<CreateCommentResponse>(
          endpoint(
            COMMENTS_CONTRACTS.create.path,
            id,
          ),
          COMMENTS_CONTRACTS.create.method,
          {
            body: body.trim(),
            isAnonymous,
          },
        );

      await Promise.all([
        this.loadComments(id),
        this.load(),
      ]);
    },

    async reply(
      postId: string,
      parentId: string,
      body: string,
      isAnonymous = false,
    ): Promise<void> {
      const contract =
        COMMENTS_CONTRACTS.createReply;

      await request<CreateReplyResponse>(
          endpoint(
            contract.path,
            parentId,
          ),
          contract.method,
          {
            body: body.trim(),
            isAnonymous,
          },
        );

      await Promise.all([
        this.loadComments(
          postId,
        ),
        this.load(),
      ]);
    },

    async updateComment(
      postId: string,
      id: string,
      body: string,
      isAnonymous?: boolean,
    ): Promise<void> {
      const existing =
        comments
          .get(postId)
          ?.find(
            (comment) =>
              comment.id === id,
          );

      if (!existing?.isOwner) {
        throw new Error(
          'You can only edit your own comment.',
        );
      }

      await request(
        endpoint(
          COMMENTS_CONTRACTS.update.path,
          id,
        ),
        'PATCH',
        {
          body: body.trim(),
          ...(isAnonymous === undefined ? {} : { isAnonymous }),
        },
      );

      await this.loadComments(
        postId,
      );
    },

    async removeComment(
      postId: string,
      id: string,
    ): Promise<void> {
      await request(
        endpoint(
          COMMENTS_CONTRACTS.remove.path,
          id,
        ),
        'DELETE',
      );

      await Promise.all([
        this.loadComments(
          postId,
        ),
        this.load(),
      ]);
    },

    async voteComment(
      postId: string,
      id: string,
      value: -1 | 1,
    ): Promise<void> {
      const previous =
        commentVotes.get(id) ??
        0;

      const selected =
        previous === value
          ? 0
          : value;

      const data =
        await request<{
          votes: number;
          userVote: Vote;
        }>(
          endpoint(
            COMMENTS_CONTRACTS.vote.path,
            id,
          ),
          'PUT',
          {
            value: selected,
          },
        );

      commentVotes.set(
        id,
        validVote(
          data.userVote,
        ),
      );

      const existing =
        comments.get(postId) ??
        [];

      comments.set(
        postId,
        existing.map(
          (comment) =>
            comment.id === id
              ? {
                  ...comment,
                  voteCount:
                    data.votes,
                  userVote:
                    validVote(
                      data.userVote,
                    ),
                }
              : comment,
        ),
      );
    },
  };
}

export type BackendSummitPostsService =
  ReturnType<
    typeof createBackendSummitPostsService
  >;