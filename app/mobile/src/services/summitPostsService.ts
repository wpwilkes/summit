import type {
  PostInput,
  SummitComment,
  SummitPost,
  SummitSummary,
} from '../types/summitPost.types';

export const POST_CATEGORIES = [
  'Politics',
  'Health',
  'Technology',
  'Sports',
  'Education',
  'Entertainment',
] as const;

export function validatePost(input: PostInput): PostInput {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const description =
    typeof input.description === 'string' ? input.description.trim() : '';

  if (!title) throw new Error('Title is required.');
  if (title.length > 160) {
    throw new Error('Title must be 160 characters or fewer.');
  }
  if (!description) throw new Error('Post content is required.');
  if (description.length > 10000) {
    throw new Error('Post content must be 10000 characters or fewer.');
  }
  if (!POST_CATEGORIES.some((category) => category === input.category)) {
    throw new Error('A valid category is required.');
  }
  if (typeof input.anonymous !== 'boolean') {
    throw new Error('Anonymous must be true or false.');
  }
  return { title, description, category: input.category, anonymous: input.anonymous };
}

/**
 * Native equivalent of the existing browser demo, not a backend API.
 * Create one instance per mounted signed-in screen. It is deliberately not
 * persisted or shared between sessions. No passwords or tokens enter this store.
 */
export function createSummitPostsService(author = 'You') {
  const posts = new Map<string, SummitPost>();
  const comments = new Map<string, SummitComment[]>();
  const summaries = new Map<string, SummitSummary>();
  let nextId = 0;
  const createId = () => `local-${Date.now()}-${++nextId}`;

  const find = (id: string): SummitPost => {
    const post = posts.get(id);
    if (!post) throw new Error('Post not found.');
    return post;
  };

  const present = (post: SummitPost): SummitPost => ({
    ...post,
    author: post.anonymous ? 'Anonymous' : author,
    commentCount: comments.get(post.id)?.length ?? 0,
  });

  return {
    list(category = ''): SummitPost[] {
      if (category && !POST_CATEGORIES.some((item) => item === category)) {
        throw new Error('A valid category is required.');
      }
      return [...posts.values()]
        .reverse()
        .filter((post) => !category || post.category === category)
        .map(present);
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
        author,
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
      Object.assign(post, validatePost(input), { updatedAt: new Date().toISOString() });
      return present(post);
    },
    remove(id: string): void {
      find(id);
      posts.delete(id);
      comments.delete(id);
      summaries.delete(id);
    },
    vote(id: string, value: -1 | 1): SummitPost {
      const post = find(id);
      if (value !== 1 && value !== -1) throw new Error('Vote must be 1 or -1.');
      const nextVote = post.userVote === value ? 0 : value;
      post.voteCount += nextVote - post.userVote;
      post.userVote = nextVote;
      return present(post);
    },
    comments(id: string): SummitComment[] {
      find(id);
      return (comments.get(id) ?? []).map((comment) => ({ ...comment }));
    },
    comment(id: string, body: string): SummitComment {
      find(id);
      const text = typeof body === 'string' ? body.trim() : '';
      if (!text) throw new Error('Comment is required.');
      if (text.length > 2000) {
        throw new Error('Comment must be 2000 characters or fewer.');
      }
      const comment: SummitComment = {
        id: createId(),
        postId: id,
        body: text,
        author,
        createdAt: new Date().toISOString(),
      };
      comments.set(id, [...(comments.get(id) ?? []), comment]);
      return { ...comment };
    },
    summary(id: string): SummitSummary | undefined {
      find(id);
      return summaries.get(id);
    },
    // a new summary replaces the one we had before
    saveSummary(id: string, text: string, commentCount: number): void {
      find(id);
      summaries.set(id, { text, commentCount });
    },
  };
}

export type SummitPostsService = ReturnType<typeof createSummitPostsService>;
