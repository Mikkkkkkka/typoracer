export interface DiscussionReply {
  id: number;
  author: string;
  text: string;
}

export interface CreateDiscussionReply {
  author: string;
  text: string;
}

export interface CreateDiscussion {
  author: string;
  title: string;
  excerpt: string;
  body: string;
}

export interface Discussion {
  id: number;
  title: string;
  author: string;
  excerpt: string;
  body: string;
  replies: DiscussionReply[];
}
