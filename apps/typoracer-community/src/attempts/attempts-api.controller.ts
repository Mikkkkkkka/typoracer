import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { AttemptDto } from './dto/attempt.dto';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { UpdateAttemptDto } from './dto/update-attempt.dto';

@ApiTags('attempts')
@Controller('api/attempts')
export class AttemptsApiController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @ApiOperation({ summary: 'Create a typing attempt' })
  @ApiCreatedResponse({ type: AttemptDto })
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
  @ApiOkResponse({ type: AttemptDto, isArray: true })
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
  @ApiOkResponse({ type: AttemptDto })
  @ApiNotFoundResponse({ description: 'Attempt was not found.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attemptsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an attempt' })
  @ApiOkResponse({ type: AttemptDto })
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
  @ApiNoContentResponse({ description: 'Attempt deleted.' })
  @ApiNotFoundResponse({ description: 'Attempt was not found.' })
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.attemptsService.remove(id);
  }
}
