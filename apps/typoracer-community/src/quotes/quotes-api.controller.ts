import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationLinkHeader } from '../common/pagination/pagination-links';
import { QuoteDetailDto } from './dto/quote-detail.dto';
import { QuoteSummaryDto } from './dto/quote-summary.dto';
import { QuotesService } from './quotes.service';

@ApiTags('quotes')
@Controller('api/quotes')
export class QuotesApiController {
  constructor(private readonly quotesService: QuotesService) {}

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
    const result = await this.quotesService.findAll(pagination);
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
    const quote = await this.quotesService.findOne(quoteId);

    if (!quote) {
      throw new NotFoundException('Quote not found.');
    }

    return quote;
  }
}
