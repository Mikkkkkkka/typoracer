import {
  BadRequestException,
  Body,
  Controller,
  Get,
  MessageEvent,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Render,
  Res,
  Sse,
} from '@nestjs/common';
import express from 'express';
import { Observable } from 'rxjs';
import { QuoteRecordsEventsService } from './quote-records-events.service';
import { CreateAttemptInput } from './quotes.models';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly quoteRecordsEvents: QuoteRecordsEventsService,
  ) {}

  @Get()
  @Render('quotes')
  async getQuotesPage() {
    return {
      currentPath: '/quotes',
      title: 'Search Quotes',
      quotes: (await this.quotesService.getQuotes()).slice(0, 60),
    };
  }

  @Sse(':quoteId/records/stream')
  async streamQuoteRecords(
    @Param('quoteId', ParseIntPipe) quoteId: number,
  ): Promise<Observable<MessageEvent>> {
    const payload = await this.quotesService.getQuoteRecordsPayload(quoteId);

    if (!payload) {
      throw new NotFoundException('Quote not found.');
    }

    return this.quoteRecordsEvents.createStream(quoteId, payload);
  }

  @Post(':quoteId/attempts')
  async createAttempt(
    @Param('quoteId', ParseIntPipe) quoteId: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.quotesService.createAttempt(
      this.parseAttemptInput(quoteId, body),
    );
  }

  @Get(':quoteId')
  async getQuoteDetail(
    @Param('quoteId') quoteId: string,
    @Res() res: express.Response,
  ) {
    const quote = await this.quotesService.getQuoteById(Number(quoteId));

    if (!quote) {
      return res.status(404).render('not-found', {
        currentPath: '',
        title: 'Quote Not Found',
      });
    }

    return res.render('quote-detail', {
      currentPath: '/quotes',
      title: `Quote ${quote.id}`,
      quote,
    });
  }

  private parseAttemptInput(
    quoteId: number,
    body: Record<string, unknown>,
  ): CreateAttemptInput {
    const userId = this.requirePositiveNumber(body.userId, 'userId');
    const accuracy = this.requirePositiveNumber(body.accuracy, 'accuracy');
    const wpm = this.requirePositiveNumber(body.wpm, 'wpm');
    const maxRawWpm =
      body.maxRawWpm === undefined
        ? wpm
        : this.requirePositiveNumber(body.maxRawWpm, 'maxRawWpm');

    return {
      quoteId,
      userId,
      accuracy,
      wpm,
      maxRawWpm,
    };
  }

  private requirePositiveNumber(value: unknown, field: string) {
    const parsedValue =
      typeof value === 'number' ? value : Number.parseFloat(String(value));

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      throw new BadRequestException(`${field} must be a positive number.`);
    }

    return parsedValue;
  }
}
