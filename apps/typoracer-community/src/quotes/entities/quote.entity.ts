export interface Quote {
  id: number;
  image: string | null;
  alt: string;
  text: string;
}

export interface QuoteRecordEntry {
  username: string;
  wpm: number;
  accuracy: number;
}

export interface QuoteDetail extends Quote {
  author: {
    username: string;
  };
  createdAt: string;
  records: QuoteRecordEntry[];
}

export interface QuoteRecordsPayload {
  quoteId: number;
  records: QuoteRecordEntry[];
  updatedAt: string;
}
