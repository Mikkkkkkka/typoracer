export interface DiscussionReply {
  author: string;
  text: string;
}

export interface CreateDiscussionReply {
  author: string;
  text: string;
}

export interface Discussion {
  id: number;
  title: string;
  author: string;
  excerpt: string;
  body: string;
  replies: DiscussionReply[];
}
