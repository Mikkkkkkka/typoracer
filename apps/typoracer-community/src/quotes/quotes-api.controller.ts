import {
  Body,
  Controller,
  Get,
  MessageEvent,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  Sse,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { CreateAttemptDto } from '../attempts/dto/create-attempt.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationLinkHeader } from '../common/pagination/pagination-links';
import { QuoteRecordsEventsService } from './quote-records-events.service';
import {
  QuoteDetailDto,
  QuoteRecordsPayloadDto,
  QuoteSummaryDto,
} from './quotes-api.models';
import { QuotesService } from './quotes.service';

@ApiTags('quotes')
@Controller('api/quotes')
export class QuotesApiController {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly quoteRecordsEvents: QuoteRecordsEventsService,
  ) {}

  @ApiOperation({ summary: 'List approved quotes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: QuoteSummaryDto, isArray: true })
  @Get()
  async findAll(
    @Query() pagination: PaginationQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.quotesService.getQuotes(pagination);
    const linkHeader = buildPaginationLinkHeader(
      request,
      pagination,
      result.hasNextPage,
    );

    if (linkHeader) {
      response.setHeader('Link', linkHeader);
    }

    return result.items;
  }

  @ApiOperation({ summary: 'Get quote details with records' })
  @ApiOkResponse({ type: QuoteDetailDto })
  @ApiNotFoundResponse({ description: 'Quote was not found.' })
  @Get(':quoteId')
  async findOne(@Param('quoteId', ParseIntPipe) quoteId: number) {
    const quote = await this.quotesService.getQuoteById(quoteId);

    if (!quote) {
      throw new NotFoundException('Quote not found.');
    }

    return quote;
  }

  @ApiOperation({ summary: 'Get current quote records snapshot' })
  @ApiOkResponse({ type: QuoteRecordsPayloadDto })
  @ApiNotFoundResponse({ description: 'Quote was not found.' })
  @Get(':quoteId/records')
  async getRecords(@Param('quoteId', ParseIntPipe) quoteId: number) {
    const payload = await this.quotesService.getQuoteRecordsPayload(quoteId);

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

  @ApiOperation({ summary: 'Create an attempt for a quote' })
  @ApiCreatedResponse({ type: QuoteRecordsPayloadDto })
  @ApiBadRequestResponse({ description: 'Invalid attempt payload.' })
  @ApiNotFoundResponse({ description: 'Quote or user was not found.' })
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
