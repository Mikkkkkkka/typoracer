import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PaginatedResult,
  PaginationParams,
} from '../common/pagination/pagination.models';
import { PrismaService } from '../prisma/prisma.service';
import { QuoteRecordsEventsService } from '../quotes/quote-records-events.service';
import { QuotesService } from '../quotes/quotes.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';
import { Attempt } from './entities/attempt.entity';

@Injectable()
export class AttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quotesService: QuotesService,
    private readonly quoteRecordsEvents: QuoteRecordsEventsService,
  ) {}

  async create(createAttemptDto: CreateAttemptDto): Promise<Attempt> {
    await this.ensureRelationsExist(
      createAttemptDto.quoteId,
      createAttemptDto.userId,
    );

    const attempt = await this.prisma.attempt.create({
      data: {
        quoteId: createAttemptDto.quoteId,
        userId: createAttemptDto.userId,
        accuracy: createAttemptDto.accuracy,
        wpm: createAttemptDto.wpm,
        maxRawWpm: createAttemptDto.maxRawWpm ?? createAttemptDto.wpm,
      },
    });

    await this.publishQuoteRecords(attempt.quoteId);

    return this.mapAttempt(attempt);
  }

  async findAll(): Promise<Attempt[]>;
  async findAll(
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Attempt>>;
  async findAll(
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Attempt> | Attempt[]> {
    const attempts = await this.prisma.attempt.findMany({
      orderBy: { id: 'asc' },
      skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
      take: pagination ? pagination.limit + 1 : undefined,
    });

    const mappedAttempts = attempts.map((attempt) => this.mapAttempt(attempt));

    if (!pagination) {
      return mappedAttempts;
    }

    return {
      items: mappedAttempts.slice(0, pagination.limit),
      hasNextPage: mappedAttempts.length > pagination.limit,
    };
  }

  async findOne(id: number): Promise<Attempt> {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found.');
    }

    return this.mapAttempt(attempt);
  }

  async findByQuote(
    quoteId: number,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Attempt>> {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      select: { id: true },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found.');
    }

    const attempts = await this.prisma.attempt.findMany({
      where: { quoteId },
      orderBy: { id: 'asc' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit + 1,
    });

    const mappedAttempts = attempts.map((attempt) => this.mapAttempt(attempt));

    return {
      items: mappedAttempts.slice(0, pagination.limit),
      hasNextPage: mappedAttempts.length > pagination.limit,
    };
  }

  async findOneByQuote(quoteId: number, id: number): Promise<Attempt> {
    const attempt = await this.prisma.attempt.findFirst({
      where: {
        id,
        quoteId,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found.');
    }

    return this.mapAttempt(attempt);
  }

  async findByUser(
    username: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Attempt>> {
    const user = await this.prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const attempts = await this.prisma.attempt.findMany({
      where: { userId: user.id },
      orderBy: { id: 'asc' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit + 1,
    });

    const mappedAttempts = attempts.map((attempt) => this.mapAttempt(attempt));

    return {
      items: mappedAttempts.slice(0, pagination.limit),
      hasNextPage: mappedAttempts.length > pagination.limit,
    };
  }

  async update(
    id: number,
    updateAttemptDto: UpdateAttemptDto,
  ): Promise<Attempt> {
    const existingAttempt = await this.prisma.attempt.findUnique({
      where: { id },
    });

    if (!existingAttempt) {
      throw new NotFoundException('Attempt not found.');
    }

    const nextQuoteId = updateAttemptDto.quoteId ?? existingAttempt.quoteId;
    const nextUserId = updateAttemptDto.userId ?? existingAttempt.userId;

    await this.ensureRelationsExist(nextQuoteId, nextUserId);

    const updatedAttempt = await this.prisma.attempt.update({
      where: { id },
      data: {
        quoteId: updateAttemptDto.quoteId,
        userId: updateAttemptDto.userId,
        accuracy: updateAttemptDto.accuracy,
        wpm: updateAttemptDto.wpm,
        maxRawWpm: updateAttemptDto.maxRawWpm,
      },
    });

    await this.publishQuoteRecords(existingAttempt.quoteId);

    if (updatedAttempt.quoteId !== existingAttempt.quoteId) {
      await this.publishQuoteRecords(updatedAttempt.quoteId);
    }

    return this.mapAttempt(updatedAttempt);
  }

  async remove(id: number): Promise<Attempt> {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found.');
    }

    const deletedAttempt = await this.prisma.attempt.delete({
      where: { id },
    });

    await this.publishQuoteRecords(deletedAttempt.quoteId);

    return this.mapAttempt(deletedAttempt);
  }

  private async ensureRelationsExist(quoteId: number, userId: number) {
    const [quote, user] = await Promise.all([
      this.prisma.quote.findUnique({
        where: { id: quoteId },
        select: { id: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      }),
    ]);

    if (!quote) {
      throw new NotFoundException('Quote not found.');
    }

    if (!user) {
      throw new NotFoundException('User not found.');
    }
  }

  private async publishQuoteRecords(quoteId: number) {
    const payload = await this.quotesService.getQuoteRecordsPayload(quoteId);

    if (payload) {
      this.quoteRecordsEvents.publish(quoteId, payload);
    }
  }

  private mapAttempt(attempt: {
    id: number;
    quoteId: number;
    userId: number;
    accuracy: number;
    wpm: number;
    maxRawWpm: number;
    createdAt: Date;
  }): Attempt {
    return {
      id: attempt.id,
      quoteId: attempt.quoteId,
      userId: attempt.userId,
      accuracy: attempt.accuracy,
      wpm: attempt.wpm,
      maxRawWpm: attempt.maxRawWpm,
      createdAt: attempt.createdAt.toISOString(),
    };
  }
}
