import { Injectable } from '@nestjs/common';
import { UserProfile } from './users.models';

const users: UserProfile[] = [
  {
    username: 'SpeedyFox',
    joinedAt: 'March 2026',
    bio: 'Competitive typer focused on quote mode and long-form consistency.',
    stats: { wpm: 102, accuracy: 99, discussions: 2 },
  },
  {
    username: 'KeyMaster',
    joinedAt: 'February 2026',
    bio: 'Mechanical keyboard enthusiast who optimizes layouts and switch feel.',
    stats: { wpm: 97, accuracy: 96, discussions: 1 },
  },
  {
    username: 'SwiftType',
    joinedAt: 'January 2026',
    bio: 'Interested in ranking systems, fairness, and sustainable speed training.',
    stats: { wpm: 93, accuracy: 95, discussions: 1 },
  },
  {
    username: 'DeskCat',
    joinedAt: 'March 2026',
    bio: 'Casual forum regular with opinions on keyboards and ergonomics.',
    stats: { wpm: 88, accuracy: 94, discussions: 0 },
  },
  {
    username: 'NovaKeys',
    joinedAt: 'March 2026',
    bio: 'Prefers practical setups over flashy gear.',
    stats: { wpm: 91, accuracy: 97, discussions: 0 },
  },
];

@Injectable()
export class UsersService {
  getUserByUsername(username: string): UserProfile | undefined {
    return users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
}
