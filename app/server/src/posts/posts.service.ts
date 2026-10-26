import { AppError } from '../errors/app.error.js';
import { getCommunityById } from '../communities/communities.repositories.js';
import { toPostContract } from './posts.mapper.js';
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
  const community = await getCommunityById(data.communityId);
  if (!community) {
    throw new AppError(404, 'COMMUNITY_NOT_FOUND', 'Community not found.');
  }
  const post = await createPost(
    data.title,
    data.body,
    userId,
    data.communityId,
  );
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
