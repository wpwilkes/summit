// Models for the signed-in Posts workspace. Public-feed models stay separate.
export type PostPhoto = {
  uri: string;
  width: number;
  height: number;
  mimeType?: string;
};

export type PostInput = {
  body: string;
  community: string;
  photo?: PostPhoto;
  /** Persist anonymous identity on the backend for all viewers. */
  isAnonymous?: boolean;
};

export type Vote = -1 | 0 | 1;

export type SummitPost = PostInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  isOwner: boolean;
  voteCount: number;
  userVote: Vote;
  commentCount: number;
};

export type SummitComment = {
  id: string;
  postId: string;
  parentId?: string | null;
  body: string;
  author: string;
  /** Persist anonymous identity on the backend for all viewers. */
  isAnonymous?: boolean;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  voteCount: number;
  userVote: Vote;
};

/** The latest AI summary of a post and its comments. */
export type PostSummary = {
  text: string;
  /** How many comments the summary was written from. */
  commentCount: number;
  createdAt: string;
};