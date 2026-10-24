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
  body: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  voteCount: number;
  userVote: Vote;
};
