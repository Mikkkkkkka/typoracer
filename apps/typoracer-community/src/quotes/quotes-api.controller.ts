import {
  Body,
  Controller,
  Get,
  MessageEvent,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CreateAttemptDto } from '../attempts/dto/create-attempt.dto';
import { QuoteRecordsEventsService } from './quote-records-events.service';
import { QuotesService } from './quotes.service';

@Controller('api/quotes')
export class QuotesApiController {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly quoteRecordsEvents: QuoteRecordsEventsService,
  ) {}

  @Get()
  findAll() {
    return this.quotesService.getQuotes();
  }

  @Get(':quoteId')
  async findOne(@Param('quoteId', ParseIntPipe) quoteId: number) {
    const quote = await this.quotesService.getQuoteById(quoteId);

    if (!quote) {
      throw new NotFoundException('Quote not found.');
    }

    return quote;
  }

  @Get(':quoteId/records')
  async getRecords(@Param('quoteId', ParseIntPipe) quoteId: number) {
    const payload = await this.quotesService.getQuoteRecordsPayload(quoteId);

    if (!payload) {
      throw new NotFoundException('Quote not found.');
    }

    return payload;
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
  createAttempt(
    @Param('quoteId', ParseIntPipe) quoteId: number,
    @Body() body: CreateAttemptDto,
  ) {
    return this.quotesService.createAttempt({
      quoteId,
      userId: body.userId,
      accuracy: body.accuracy,
      wpm: body.wpm,
      maxRawWpm: body.maxRawWpm ?? body.wpm,
    });
  }
}
