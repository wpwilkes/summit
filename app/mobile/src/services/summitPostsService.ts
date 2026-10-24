import type {
  PostInput,
  PostPhoto,
  SummitComment,
  SummitPost,
} from '../types/summitPost.types';

export const POST_COMMUNITIES = [
  'politics',
  'health',
  'technology',
  'sport',
  'education',
  'entertainment',
] as const;

function validatePhoto(photo?: PostPhoto): PostPhoto | undefined {
  if (!photo) return undefined;
  if (
    typeof photo.uri !== 'string' ||
    !/^(file:|content:|ph:|https?:|blob:|data:image\/)/i.test(photo.uri) ||
    !Number.isFinite(photo.width) ||
    !Number.isFinite(photo.height) ||
    photo.width <= 0 ||
    photo.height <= 0 ||
    (photo.mimeType && !photo.mimeType.startsWith('image/'))
  ) {
    throw new Error('Choose a valid photo. Only images are supported.');
  }
  return { ...photo };
}

export function validatePost(input: PostInput): PostInput {
  const body = typeof input.body === 'string' ? input.body.trim() : '';
  const photo = validatePhoto(input.photo);
  if (!body && !photo) throw new Error('Write a message or add a photo.');
  if (body.length > 10000) {
    throw new Error('Post content must be 10000 characters or fewer.');
  }
  if (!POST_COMMUNITIES.some((item) => item === input.community)) {
    throw new Error('Select a valid community.');
  }
  return { body, community: input.community, photo };
}

function validateComment(body: string): string {
  const text = typeof body === 'string' ? body.trim() : '';
  if (!text) throw new Error('Comment is required.');
  if (text.length > 2000) {
    throw new Error('Comment must be 2000 characters or fewer.');
  }
  return text;
}

/**
 * Existing local-only storage: one instance per signed-in Posts screen.
 * Photos are device URIs, not uploaded files. Everything resets on reload/logout.
 * There are no post/comment backend requests or authentication changes here.
 */
export function createSummitPostsService(author = 'You') {
  const posts = new Map<string, SummitPost>();
  const comments = new Map<string, SummitComment[]>();
  const username = author.trim().replace(/^u\//i, '') || 'You';
  let nextId = 0;
  const createId = () => `local-${Date.now()}-${++nextId}`;

  const find = (id: string): SummitPost => {
    const post = posts.get(id);
    if (!post) throw new Error('Post not found.');
    return post;
  };

  const findComment = (postId: string, id: string): SummitComment => {
    find(postId);
    const comment = comments.get(postId)?.find((item) => item.id === id);
    if (!comment) throw new Error('Comment not found.');
    return comment;
  };

  const requireOwner = (item: { isOwner: boolean }) => {
    if (!item.isOwner)
      throw new Error('You can only edit or delete your own content.');
  };

  const present = (post: SummitPost): SummitPost => ({
    ...post,
    photo: post.photo ? { ...post.photo } : undefined,
    commentCount: comments.get(post.id)?.length ?? 0,
  });

  const applyVote = (item: SummitPost | SummitComment, value: -1 | 1) => {
    if (value !== 1 && value !== -1) throw new Error('Vote must be 1 or -1.');
    const nextVote = item.userVote === value ? 0 : value;
    item.voteCount += nextVote - item.userVote;
    item.userVote = nextVote;
  };

  return {
    list(): SummitPost[] {
      return [...posts.values()].reverse().map(present);
    },
    get(id: string): SummitPost {
      return present(find(id));
    },
    create(input: PostInput): SummitPost {
      const fields = validatePost(input);
      const timestamp = new Date().toISOString();
      const post: SummitPost = {
        ...fields,
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        author: username,
        isOwner: true,
        voteCount: 0,
        userVote: 0,
        commentCount: 0,
      };
      posts.set(post.id, post);
      return present(post);
    },
    update(id: string, input: PostInput): SummitPost {
      const post = find(id);
      requireOwner(post);
      Object.assign(post, validatePost(input), {
        updatedAt: new Date().toISOString(),
      });
      return present(post);
    },
    remove(id: string): void {
      requireOwner(find(id));
      posts.delete(id);
      comments.delete(id);
    },
    vote(id: string, value: -1 | 1): SummitPost {
      const post = find(id);
      applyVote(post, value);
      return present(post);
    },
    comments(id: string): SummitComment[] {
      find(id);
      return (comments.get(id) ?? []).map((comment) => ({ ...comment }));
    },
    comment(id: string, body: string): SummitComment {
      find(id);
      const text = validateComment(body);
      const timestamp = new Date().toISOString();
      const comment: SummitComment = {
        id: createId(),
        postId: id,
        body: text,
        author: username,
        createdAt: timestamp,
        updatedAt: timestamp,
        isOwner: true,
        voteCount: 0,
        userVote: 0,
      };
      comments.set(id, [...(comments.get(id) ?? []), comment]);
      return { ...comment };
    },
    updateComment(postId: string, id: string, body: string): SummitComment {
      const comment = findComment(postId, id);
      requireOwner(comment);
      const text = validateComment(body);
      comment.body = text;
      comment.updatedAt = new Date().toISOString();
      return { ...comment };
    },
    removeComment(postId: string, id: string): void {
      requireOwner(findComment(postId, id));
      comments.set(
        postId,
        (comments.get(postId) ?? []).filter((item) => item.id !== id),
      );
    },
    voteComment(postId: string, id: string, value: -1 | 1): SummitComment {
      const comment = findComment(postId, id);
      applyVote(comment, value);
      return { ...comment };
    },
  };
}

export type SummitPostsService = ReturnType<typeof createSummitPostsService>;
