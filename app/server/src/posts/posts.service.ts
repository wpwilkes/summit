import { AppError } from '../errors/app.error.js';
import { HttpStatus } from '../errors/http-status.js';
import { ErrorCode } from '../errors/error-code.js';
import { DatabasePost, toPostContract } from './posts.mapper.js';
import {
  createPost,
  getAllPosts,
  getByIdPost,
  getCommunityById,
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

async function requireExistingPost(postId: number): Promise<DatabasePost> {
  const post = await getByIdPost(postId);
  if (!post) {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.POST_NOT_FOUND,
      'Post not found.',
    );
  }
  return post;
}

export async function createPostService(
  data: CreatePostRequest,
  userId: number,
): Promise<CreatePostResponse> {
  const community = await getCommunityById(data.communityId);
  if (!community) {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.COMMUNITY_NOT_FOUND,
      'Community not found.',
    );
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
  postId: number,
): Promise<GetByIdPostResponse> {
  const post = await requireExistingPost(postId);
  return {
    post: toPostContract(post),
  };
}

export async function getPostVoteService(
  postId: number,
  userId: number,
): Promise<PostVoteResponse> {
  const post = await requireExistingPost(postId);
  const result = await getPostVote(postId, userId);
  return {
    votes: post.vote,
    userVote: result.vote,
  };
}

export async function removePostService(
  postId: number,
  userId: number,
): Promise<RemovePostResponse> {
  const existingPost = await requireExistingPost(postId);
  if (existingPost.authorId !== userId) {
    throw new AppError(
      HttpStatus.FORBIDDEN,
      ErrorCode.FORBIDDEN,
      "You cannot delete another user's post.",
    );
  }
  await removePost(postId);
  return { success: true };
}

export async function updatePostService(
  postId: number,
  userId: number,
  data: UpdatePostRequest,
): Promise<UpdatePostResponse> {
  const existingPost = await requireExistingPost(postId);
  if (existingPost.authorId !== userId) {
    throw new AppError(
      HttpStatus.FORBIDDEN,
      ErrorCode.FORBIDDEN,
      "You cannot edit another user's post.",
    );
  }
  const updatedPost = await updatePost(postId, data);
  return {
    post: toPostContract(updatedPost),
  };
}

export async function votePostService(
  postId: number,
  userId: number,
  data: PostVoteRequest,
): Promise<PostVoteResponse> {
  await requireExistingPost(postId);
  const result = await setPostVote(postId, userId, data.value);
  if (!result) {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.POST_NOT_FOUND,
      'Post not found.',
    );
  }
  return result;
}
