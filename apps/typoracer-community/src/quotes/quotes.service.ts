import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  QuoteDetail,
  QuoteLeaderboardEntry,
  QuoteSummary,
} from './quotes.models';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuotes(): Promise<QuoteSummary[]> {
    return this.prisma.quote.findMany({
      where: { status: 'APPROVED' },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        image: true,
        alt: true,
        text: true,
      },
    });
  }

  async getQuoteById(quoteId: number): Promise<QuoteDetail | undefined> {
    const quote = await this.prisma.quote.findFirst({
      where: {
        id: quoteId,
        status: 'APPROVED',
      },
      select: {
        id: true,
        image: true,
        alt: true,
        text: true,
        createdAt: true,
        author: {
          select: {
            username: true,
          },
        },
        attempts: {
          select: {
            wpm: true,
            accuracy: true,
            user: {
              select: {
                username: true,
              },
            },
          },
          orderBy: [
            { wpm: 'desc' },
            { accuracy: 'desc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    if (!quote) {
      return undefined;
    }

    const bestAttemptByUser = new Map<string, QuoteLeaderboardEntry>();

    for (const attempt of quote.attempts) {
      const username = attempt.user.username;
      const currentBest = bestAttemptByUser.get(username);

      if (
        !currentBest ||
        attempt.wpm > currentBest.wpm ||
        (attempt.wpm === currentBest.wpm &&
          attempt.accuracy > currentBest.accuracy)
      ) {
        bestAttemptByUser.set(username, {
          username,
          wpm: Math.round(attempt.wpm),
          accuracy: Math.round(attempt.accuracy),
        });
      }
    }

    return {
      id: quote.id,
      image: quote.image,
      alt: quote.alt,
      text: quote.text,
      createdAt: new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(quote.createdAt),
      author: {
        username: quote.author.username,
      },
      leaderboard: Array.from(bestAttemptByUser.values()).sort(
        (left, right) => {
          if (right.wpm !== left.wpm) {
            return right.wpm - left.wpm;
          }

          return right.accuracy - left.accuracy;
        },
      ),
    };
  }
}
