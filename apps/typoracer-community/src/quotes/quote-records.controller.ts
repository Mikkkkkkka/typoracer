import {
  Controller,
  Get,
  MessageEvent,
  NotFoundException,
  Param,
  ParseIntPipe,
  Sse,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { QuoteRecordsPayloadDto } from './dto/quote-records-payload.dto';
import { QuoteRecordsService } from './quote-records.service';
import { QuotesRecordsEventsService } from './quotes-records-events.service';

@ApiTags('quotes')
@Controller('api/quotes/:quoteId/records')
export class QuoteRecordsController {
  constructor(
    private readonly quoteRecordsService: QuoteRecordsService,
    private readonly quotesRecordsEvents: QuotesRecordsEventsService,
  ) {}

  @ApiOperation({ summary: 'Get current quote records snapshot' })
  @ApiOkResponse({ type: QuoteRecordsPayloadDto })
  @ApiNotFoundResponse({ description: 'Quote was not found.' })
  @Get()
  async findOne(@Param('quoteId', ParseIntPipe) quoteId: number) {
    const payload = await this.quoteRecordsService.findPayload(quoteId);

    if (!payload) {
      throw new NotFoundException('Quote not found.');
    }

    return payload;
  }

  @ApiOperation({ summary: 'Stream quote record updates over SSE' })
  @ApiOkResponse({
    description: 'Server-sent events stream of quote record updates.',
  })
  @ApiNotFoundResponse({ description: 'Quote was not found.' })
  @Sse('stream')
  async stream(
    @Param('quoteId', ParseIntPipe) quoteId: number,
  ): Promise<Observable<MessageEvent>> {
    const payload = await this.quoteRecordsService.findPayload(quoteId);

    if (!payload) {
      throw new NotFoundException('Quote not found.');
    }

    return this.quotesRecordsEvents.createStream(quoteId, payload);
  }
}
