export interface QuoteSummary {
  id: number;
  image: string;
  alt: string;
  text: string;
}

export interface QuoteDetail extends QuoteSummary {
  author: QuoteAuthor;
  createdAt: string;
  records: QuoteRecordEntry[];
}

export interface QuoteAuthor {
  username: string;
}

export interface QuoteRecordEntry {
  username: string;
  wpm: number;
  accuracy: number;
}

export interface QuoteRecordsPayload {
  quoteId: number;
  records: QuoteRecordEntry[];
  updatedAt: string;
}

export interface CreateAttemptInput {
  quoteId: number;
  userId: number;
  accuracy: number;
  wpm: number;
  maxRawWpm: number;
}
