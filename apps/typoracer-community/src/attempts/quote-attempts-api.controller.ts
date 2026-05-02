import {
  Controller,
  Get,
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
import { AttemptsService } from './attempts.service';
import { AttemptDto } from './dto/attempt.dto';

@ApiTags('quotes')
@Controller('api/quotes/:quoteId/attempts')
export class QuoteAttemptsApiController {
  constructor(private readonly attemptsService: AttemptsService) {}

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
