import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
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
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationLinkHeader } from '../common/pagination/pagination-links';
import { QuoteRecordsPayloadDto } from '../quotes/dto/quote-records-payload.dto';
import { QuoteRecordsService } from '../quotes/quote-records.service';
import { AttemptsService } from './attempts.service';
import { AttemptDto } from './dto/attempt.dto';
import { CreateAttemptDto } from './dto/create-attempt.dto';

@ApiTags('quotes')
@Controller('api/quotes/:quoteId/attempts')
export class QuoteAttemptsApiController {
  constructor(
    private readonly attemptsService: AttemptsService,
    private readonly quoteRecordsService: QuoteRecordsService,
  ) {}

  @ApiOperation({ summary: 'Create an attempt for a quote' })
  @ApiCreatedResponse({ type: QuoteRecordsPayloadDto })
  @ApiBadRequestResponse({ description: 'Invalid attempt payload.' })
  @ApiNotFoundResponse({ description: 'Quote or user was not found.' })
  @Post()
  async create(
    @Param('quoteId', ParseIntPipe) quoteId: number,
    @Body() body: CreateAttemptDto,
  ) {
    await this.attemptsService.create({
      ...body,
      quoteId,
      maxRawWpm: body.maxRawWpm ?? body.wpm,
    });

    const payload = await this.quoteRecordsService.findPayload(quoteId);

    if (!payload) {
      throw new NotFoundException('Quote not found.');
    }

    return payload;
  }

  @ApiOperation({ summary: 'List attempts for a quote' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: AttemptDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Quote was not found.' })
  @Get()
  async findAll(
    @Param('quoteId', ParseIntPipe) quoteId: number,
    @Query() pagination: PaginationQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.attemptsService.findByQuote(quoteId, pagination);
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

  @ApiOperation({ summary: 'Get a quote attempt by id' })
  @ApiOkResponse({ type: AttemptDto })
  @ApiNotFoundResponse({ description: 'Attempt was not found.' })
  @Get(':attemptId')
  findOne(
    @Param('quoteId', ParseIntPipe) quoteId: number,
    @Param('attemptId', ParseIntPipe) attemptId: number,
  ) {
    return this.attemptsService.findOneByQuote(quoteId, attemptId);
  }
}
