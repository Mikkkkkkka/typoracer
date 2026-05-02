import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  PaginatedResult,
  PaginationParams,
} from '../common/pagination/pagination.models';
import { PrismaService } from '../prisma/prisma.service';
import { Quote, QuoteDetail } from './entities/quote.entity';
import { QuotesRecordsService } from './quotes-records.service';

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quoteRecordsService: QuotesRecordsService,
  ) {}

  async findAll(): Promise<Quote[]>;
  async findAll(pagination: PaginationParams): Promise<PaginatedResult<Quote>>;
  async findAll(
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Quote> | Quote[]> {
    if (!pagination) {
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

    const quotes = await this.prisma.quote.findMany({
      where: { status: 'APPROVED' },
      orderBy: { id: 'asc' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit + 1,
      select: {
        id: true,
        image: true,
        alt: true,
        text: true,
      },
    });

    return {
      items: quotes.slice(0, pagination.limit),
      hasNextPage: quotes.length > pagination.limit,
    };
  }

  async findOne(quoteId: number): Promise<QuoteDetail | undefined> {
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
      records: await this.quoteRecordsService.findByQuote(quote.id),
    };
  }

  async submitQuote(input: {
    authorUsername: string;
    text: string;
    source?: string;
  }) {
    const author = await this.prisma.user.findFirst({
      where: {
        username: {
          equals: input.authorUsername.trim(),
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
      },
    });

    if (!author) {
      return undefined;
    }

    const source = input.source?.trim() || null;
    const quote = await this.prisma.quote.create({
      data: {
        authorId: author.id,
        image: null,
        alt: source || 'Submitted quote',
        text: input.text.trim(),
        source,
        status: 'SUBMITTED',
      },
      select: {
        id: true,
        text: true,
        source: true,
        status: true,
      },
    });

    return quote;
  }

  async updateQuote(
    quoteId: number,
    authorUsername: string,
    input: {
      text?: string;
      source?: string;
    },
  ) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        author: {
          select: {
            username: true,
          },
        },
        status: true,
      },
    });

    if (!quote) {
      return undefined;
    }

    if (
      quote.author.username.toLowerCase() !==
      authorUsername.trim().toLowerCase()
    ) {
      throw new ForbiddenException('You can only edit your own quotes.');
    }

    const source =
      input.source === undefined ? undefined : input.source.trim() || null;
    const updatedQuote = await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        text: input.text === undefined ? undefined : input.text.trim(),
        source,
        alt:
          input.source === undefined ? undefined : source || 'Submitted quote',
      },
      select: {
        id: true,
        text: true,
        source: true,
        status: true,
      },
    });

    return updatedQuote;
  }

  async deleteQuote(quoteId: number, authorUsername: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!quote) {
      return false;
    }

    if (
      quote.author.username.toLowerCase() !==
      authorUsername.trim().toLowerCase()
    ) {
      throw new ForbiddenException('You can only delete your own quotes.');
    }

    await this.prisma.quote.delete({
      where: { id: quoteId },
    });

    return true;
  }

  private formatLongDate(date: Date) {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
}
