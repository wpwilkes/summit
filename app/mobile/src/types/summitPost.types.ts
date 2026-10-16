// Models for the signed-in Posts demo. Keep the public-feed models separate.
export type PostInput = {
  title: string;
  description: string;
  category: string;
  anonymous: boolean;
};

export type SummitPost = PostInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  isOwner: boolean;
  voteCount: number;
  userVote: -1 | 0 | 1;
  commentCount: number;
};

export type SummitComment = {
  id: string;
  postId: string;
  body: string;
  author: string;
  createdAt: string;
};
