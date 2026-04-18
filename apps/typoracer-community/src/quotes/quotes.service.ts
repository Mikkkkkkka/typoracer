import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Quote } from './quotes.models';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuotes(): Promise<Quote[]> {
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

  async getQuoteById(quoteId: number): Promise<Quote | undefined> {
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
      },
    });

    return quote ?? undefined;
  }
}
