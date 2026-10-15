// Browser-only sample data. No server, database, or authentication changes.
const categories = [
  'Politics',
  'Health',
  'Technology',
  'Sports',
  'Education',
  'Entertainment',
];

function validate(input) {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const description =
    typeof input.description === 'string' ? input.description.trim() : '';

  if (!title) throw new Error('Title is required.');
  if (title.length > 160)
    throw new Error('Title must be 160 characters or fewer.');
  if (!description) throw new Error('Post content is required.');
  if (description.length > 10000) {
    throw new Error('Post content must be 10000 characters or fewer.');
  }
  if (!categories.includes(input.category)) {
    throw new Error('A valid category is required.');
  }
  if (typeof input.anonymous !== 'boolean') {
    throw new Error('Anonymous must be true or false.');
  }

  return {
    title,
    description,
    category: input.category,
    anonymous: input.anonymous,
  };
}

export function createDemoPostsApi() {
  const posts = new Map();
  const comments = new Map();
  const votes = new Map();
  let nextId = 0;

  // Inline mobile WebViews do not always expose crypto.randomUUID.
  // These IDs identify local demo records, not authentication tokens.
  function createId() {
    return globalThis.crypto?.randomUUID?.() ??
      `demo-${Date.now()}-${++nextId}`;
  }

  function find(id) {
    const post = posts.get(id);
    if (!post) throw new Error('Post not found.');
    return post;
  }

  function present(post) {
    return {
      ...post,
      author: post.anonymous ? 'Anonymous' : 'Ayman',
      isOwner: true,
      voteCount: votes.get(post.id) ?? 0,
      commentCount: comments.get(post.id)?.length ?? 0,
    };
  }

  return {
    async categories() {
      return [...categories];
    },

    async list(category = '') {
      if (category && !categories.includes(category)) {
        throw new Error('A valid category is required.');
      }
      return [...posts.values()]
        .reverse()
        .filter((post) => !category || post.category === category)
        .map(present);
    },

    async get(id) {
      return present(find(id));
    },

    async create(input) {
      const fields = validate(input ?? {});
      const timestamp = new Date().toISOString();
      const post = {
        id: createId(),
        ...fields,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      posts.set(post.id, post);
      return present(post);
    },

    async update(id, input) {
      const post = find(id);
      const fields = validate({ ...post, ...input });
      Object.assign(post, fields, { updatedAt: new Date().toISOString() });
      return present(post);
    },

    async remove(id) {
      find(id);
      posts.delete(id);
      comments.delete(id);
      votes.delete(id);
      return { deleted: true };
    },

    async vote(id, value) {
      const post = find(id);
      if (value !== 1 && value !== -1) {
        throw new Error('Vote must be 1 or -1.');
      }
      votes.set(id, votes.get(id) === value ? 0 : value);
      return present(post);
    },

    async comments(id) {
      find(id);
      return structuredClone(comments.get(id) ?? []);
    },

    async comment(id, body) {
      find(id);
      const text = typeof body === 'string' ? body.trim() : '';
      if (!text) throw new Error('Comment is required.');
      if (text.length > 2000) {
        throw new Error('Comment must be 2000 characters or fewer.');
      }
      const comment = {
        id: createId(),
        postId: id,
        body: text,
        author: 'Ayman',
        createdAt: new Date().toISOString(),
      };
      comments.set(id, [...(comments.get(id) ?? []), comment]);
      return { ...comment };
    },
  };
}

export const demoPostsApi = createDemoPostsApi();
