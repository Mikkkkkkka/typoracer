export interface QuoteSummary {
  id: number;
  image: string;
  alt: string;
  text: string;
}

export interface QuoteDetail extends QuoteSummary {
  author: QuoteAuthor;
  createdAt: string;
  leaderboard: QuoteLeaderboardEntry[];
}

export interface QuoteAuthor {
  username: string;
}

export interface QuoteLeaderboardEntry {
  username: string;
  wpm: number;
  accuracy: number;
}
