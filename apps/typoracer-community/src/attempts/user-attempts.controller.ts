import {
  Controller,
  Get,
  Param,
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
import { Attempt } from './entities/attempt.entity';
import { AttemptsService } from './attempts.service';

@ApiTags('users')
@Controller('api/users/:username/attempts')
export class UserAttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @ApiOperation({ summary: 'List attempts created by a user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: Attempt, isArray: true })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  @Get()
  async findAll(
    @Param('username') username: string,
    @Query() pagination: PaginationQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.attemptsService.findByUser(username, pagination);
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
}
