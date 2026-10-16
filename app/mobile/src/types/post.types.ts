export type Reply = {
  id: string;
  author: string;
  timeAgo: string;
  body: string;
  voteCount: number;
};

export type Post = {
  id: string;
  community: string;
  author: string;
  timeAgo: string;

  title: string;
  description: string;

  category: string;
  tags: string[];

  voteCount: number;
  replyCount: number;

  summaryTone:
    | 'Broad consensus'
    | 'Divided opinions'
    | 'Informative thread'
    | 'Light-hearted';

  aiSummary?: string;

  replies?: Reply[];
};