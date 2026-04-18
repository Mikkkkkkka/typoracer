import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserProfile } from './users.models';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByUsername(username: string): Promise<UserProfile | undefined> {
    const user = await this.prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
      include: {
        attempts: {
          select: {
            accuracy: true,
            wpm: true,
          },
        },
        _count: {
          select: {
            discussions: true,
          },
        },
      },
    });

    if (!user) {
      return undefined;
    }

    const bestWpm = user.attempts.reduce(
      (currentBest, attempt) => Math.max(currentBest, attempt.wpm),
      0,
    );
    const averageAccuracy =
      user.attempts.length === 0
        ? 0
        : user.attempts.reduce(
            (total, attempt) => total + attempt.accuracy,
            0,
          ) / user.attempts.length;

    return {
      username: user.username,
      joinedAt: new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
      }).format(user.joinedAt),
      bio: user.bio,
      stats: {
        wpm: Math.round(bestWpm),
        accuracy: Math.round(averageAccuracy),
        discussions: user._count.discussions,
      },
    };
  }
}
