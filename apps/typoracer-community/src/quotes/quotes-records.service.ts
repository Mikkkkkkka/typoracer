import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuoteRecordEntry, QuoteRecordsPayload } from './entities/quote.entity';

@Injectable()
export class QuotesRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByQuote(quoteId: number): Promise<QuoteRecordEntry[]> {
    const attempts = await this.prisma.attempt.findMany({
      where: {
        quoteId,
        quote: {
          status: 'APPROVED',
        },
      },
      select: {
        wpm: true,
        accuracy: true,
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: [{ wpm: 'desc' }, { accuracy: 'desc' }, { createdAt: 'asc' }],
    });

    return this.buildQuoteRecords(attempts);
  }

  async findPayload(quoteId: number): Promise<QuoteRecordsPayload | undefined> {
    const quote = await this.prisma.quote.findFirst({
      where: {
        id: quoteId,
        status: 'APPROVED',
      },
      select: {
        id: true,
      },
    });

    if (!quote) {
      return undefined;
    }

    return {
      quoteId: quote.id,
      records: await this.findByQuote(quote.id),
      updatedAt: new Date().toISOString(),
    };
  }

  private buildQuoteRecords(
    attempts: Array<{
      wpm: number;
      accuracy: number;
      user: { username: string };
    }>,
  ) {
    const bestAttemptByUser = new Map<string, QuoteRecordEntry>();

    for (const attempt of attempts) {
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

    return Array.from(bestAttemptByUser.values()).sort((left, right) => {
      if (right.wpm !== left.wpm) {
        return right.wpm - left.wpm;
      }

      return right.accuracy - left.accuracy;
    });
  }
}
