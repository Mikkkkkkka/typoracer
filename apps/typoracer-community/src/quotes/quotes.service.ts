import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuoteRecordsEventsService } from './quote-records-events.service';
import {
  CreateAttemptInput,
  QuoteDetail,
  QuoteRecordEntry,
  QuoteRecordsPayload,
  QuoteSummary,
} from './quotes.models';

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quoteRecordsEvents: QuoteRecordsEventsService,
  ) {}

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
      },
    });

    if (!quote) {
      return undefined;
    }

    return {
      id: quote.id,
      image: quote.image,
      alt: quote.alt,
      text: quote.text,
      createdAt: this.formatLongDate(quote.createdAt),
      author: {
        username: quote.author.username,
      },
      records: await this.getQuoteRecords(quote.id),
    };
  }

  async getQuoteRecords(quoteId: number): Promise<QuoteRecordEntry[]> {
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

  async getQuoteRecordsPayload(
    quoteId: number,
  ): Promise<QuoteRecordsPayload | undefined> {
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
      records: await this.getQuoteRecords(quote.id),
      updatedAt: new Date().toISOString(),
    };
  }

  async createAttempt(input: CreateAttemptInput): Promise<QuoteRecordsPayload> {
    const [quote, user] = await Promise.all([
      this.prisma.quote.findFirst({
        where: {
          id: input.quoteId,
          status: 'APPROVED',
        },
        select: {
          id: true,
        },
      }),
      this.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!quote) {
      throw new NotFoundException('Quote not found.');
    }

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.prisma.attempt.create({
      data: {
        quoteId: input.quoteId,
        userId: input.userId,
        accuracy: input.accuracy,
        wpm: input.wpm,
        maxRawWpm: input.maxRawWpm,
      },
    });

    const payload: QuoteRecordsPayload = {
      quoteId: input.quoteId,
      records: await this.getQuoteRecords(input.quoteId),
      updatedAt: new Date().toISOString(),
    };

    this.quoteRecordsEvents.publish(input.quoteId, payload);

    return payload;
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

  private formatLongDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }
}
