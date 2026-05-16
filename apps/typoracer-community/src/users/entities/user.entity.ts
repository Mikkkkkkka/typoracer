export interface User {
  id: number;
  username: string;
  joinedAt: string;
  bio: string | null;
}

export interface UserProfile extends User {
  stats: {
    wpm: number;
    accuracy: number;
    discussions: number;
  };
}
