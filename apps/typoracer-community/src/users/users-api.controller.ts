import {
  Controller,
  Get,
  NotFoundException,
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
import { AttemptsService } from '../attempts/attempts.service';
import { Attempt } from '../attempts/entities/attempt.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationLinkHeader } from '../common/pagination/pagination-links';
import { DiscussionsService } from '../discussions/discussions.service';
import { DiscussionDto } from '../discussions/discussions-api.models';
import {
  UserProfileWithDiscussionsDto,
  UserSummaryDto,
} from './users-api.models';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('api/users')
export class UsersApiController {
  constructor(
    private readonly attemptsService: AttemptsService,
    private readonly usersService: UsersService,
    private readonly discussionsService: DiscussionsService,
  ) {}

  @ApiOperation({ summary: 'List users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: UserSummaryDto, isArray: true })
  @Get()
  async findAll(
    @Query() pagination: PaginationQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.usersService.getUsers(pagination);
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

  @ApiOperation({ summary: 'Get a user profile by username' })
  @ApiOkResponse({ type: UserProfileWithDiscussionsDto })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  @Get(':username')
  async findOne(@Param('username') username: string) {
    const user = await this.usersService.getUserByUsername(username);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return {
      ...user,
      discussions: await this.discussionsService.getDiscussionsByAuthor(
        user.username,
      ),
    };
  }

  @ApiOperation({ summary: 'List discussions created by a user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: DiscussionDto, isArray: true })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  @Get(':username/discussions')
  async findDiscussions(
    @Param('username') username: string,
    @Query() pagination: PaginationQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.usersService.getUserByUsername(username);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const result = await this.discussionsService.getDiscussionsByAuthor(
      user.username,
      pagination,
    );
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

  @ApiOperation({ summary: 'List attempts created by a user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: Attempt, isArray: true })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  @Get(':username/attempts')
  async findAttempts(
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
