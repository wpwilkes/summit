import { AppError } from '../errors/app.error.js';
import {
  createPost,
  getAllPosts,
  getByIdPost,
  getPostVote,
  removePost,
  setPostVote,
  updatePost,
} from './posts.repositories.js';
import type {
  Post,
  CreatePostRequest,
  CreatePostResponse,
  GetAllPostsResponse,
  GetByIdPostResponse,
  PostVoteRequest,
  PostVoteResponse,
  RemovePostResponse,
  UpdatePostRequest,
  UpdatePostResponse,
} from '@summit/shared';

type DatabasePost = Awaited<ReturnType<typeof createPost>>;

function toPostContract(post: DatabasePost): Post {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    authorId: post.authorId,
    votes: post.vote,
    createdAt: post.createdAt.toISOString(),
  };
}

async function requireExistingPost(id: number): Promise<DatabasePost> {
  const post = await getByIdPost(id);
  if (!post) {
    throw new AppError(404, 'POST_NOT_FOUND', 'Post not found.');
  }
  return post;
}

export async function createPostService(
  data: CreatePostRequest,
  userId: number,
): Promise<CreatePostResponse> {
  const post = await createPost(data.title, data.body, userId);
  return {
    post: toPostContract(post),
  };
}

export async function getAllPostsService(): Promise<GetAllPostsResponse> {
  const posts = await getAllPosts();
  return {
    posts: posts.map(toPostContract),
  };
}

export async function getByIdPostService(
  id: number,
): Promise<GetByIdPostResponse> {
  const post = await requireExistingPost(id);
  return {
    post: toPostContract(post),
  };
}

export async function getPostVoteService(
  postId: number,
  userId: number,
): Promise<PostVoteResponse> {
  const result = await getPostVote(postId, userId);
  if (!result) {
    throw new AppError(404, 'POST_NOT_FOUND', 'Post not found.');
  }
  return result;
}

export async function removePostService(
  id: number,
  userId: number,
): Promise<RemovePostResponse> {
  const existingPost = await requireExistingPost(id);
  if (existingPost.authorId !== userId) {
    throw new AppError(
      403,
      'FORBIDDEN',
      "You cannot delete another user's post.",
    );
  }
  await removePost(id);
  return { success: true };
}

export async function updatePostService(
  id: number,
  userId: number,
  data: UpdatePostRequest,
): Promise<UpdatePostResponse> {
  const existingPost = await requireExistingPost(id);
  if (existingPost.authorId !== userId) {
    throw new AppError(
      403,
      'FORBIDDEN',
      "You cannot edit another user's post.",
    );
  }
  const updatedPost = await updatePost(id, data);
  return {
    post: toPostContract(updatedPost),
  };
}

export async function votePostService(
  postId: number,
  userId: number,
  data: PostVoteRequest,
): Promise<PostVoteResponse> {
  const result = await setPostVote(postId, userId, data.value);
  if (!result) {
    throw new AppError(404, 'POST_NOT_FOUND', 'Post not found.');
  }
  return result;
}
