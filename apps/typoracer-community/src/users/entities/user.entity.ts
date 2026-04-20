export interface User {
  username: string;
  joinedAt: string;
  bio: string;
}

export interface UserProfile extends User {
  stats: {
    wpm: number;
    accuracy: number;
    discussions: number;
  };
}
