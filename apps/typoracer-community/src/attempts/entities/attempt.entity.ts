export interface CreateAttempt {
  quoteId: number;
  userId: number;
  accuracy: number;
  wpm: number;
  maxRawWpm?: number;
}

export interface UpdateAttempt {
  quoteId?: number;
  userId?: number;
  accuracy?: number;
  wpm?: number;
  maxRawWpm?: number;
}

export interface Attempt {
  id: number;
  quoteId: number;
  userId: number;
  accuracy: number;
  wpm: number;
  maxRawWpm: number;
  createdAt: string;
}
