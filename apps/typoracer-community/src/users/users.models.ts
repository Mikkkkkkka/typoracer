export interface UserStats {
  wpm: number;
  accuracy: number;
  discussions: number;
}

export interface UserProfile {
  username: string;
  joinedAt: string;
  bio: string;
  stats: UserStats;
}
