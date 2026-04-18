import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
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
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';
import { Attempt } from './entities/attempt.entity';

@ApiTags('attempts')
@Controller('api/attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @ApiOperation({ summary: 'Create a typing attempt' })
  @ApiCreatedResponse({ type: Attempt })
  @ApiBadRequestResponse({ description: 'Invalid attempt payload.' })
  @ApiNotFoundResponse({ description: 'Related quote or user was not found.' })
  @Post()
  create(@Body() body: CreateAttemptDto) {
    return this.attemptsService.create({
      ...body,
      maxRawWpm: body.maxRawWpm ?? body.wpm,
    });
  }

  @ApiOperation({ summary: 'List all attempts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: Attempt, isArray: true })
  @Get()
  async findAll(
    @Query() pagination: PaginationQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.attemptsService.findAll(pagination);
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

  @ApiOperation({ summary: 'Get an attempt by id' })
  @ApiOkResponse({ type: Attempt })
  @ApiNotFoundResponse({ description: 'Attempt was not found.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attemptsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an attempt' })
  @ApiOkResponse({ type: Attempt })
  @ApiBadRequestResponse({ description: 'Invalid update payload.' })
  @ApiNotFoundResponse({
    description: 'Attempt, quote, or user was not found.',
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAttemptDto,
  ) {
    return this.attemptsService.update(id, body);
  }

  @ApiOperation({ summary: 'Delete an attempt' })
  @ApiOkResponse({ type: Attempt })
  @ApiNoContentResponse({ description: 'Attempt deleted.' })
  @ApiNotFoundResponse({ description: 'Attempt was not found.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attemptsService.remove(id);
  }
}
