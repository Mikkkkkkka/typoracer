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
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationLinkHeader } from '../common/pagination/pagination-links';
import { DiscussionsService } from '../discussions/discussions.service';
import { UserProfileWithDiscussionsDto } from './dto/user-profile-with-discussions.dto';
import { UserSummaryDto } from './dto/user-summary.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('api/users')
export class UsersApiController {
  constructor(
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
    const result = await this.usersService.findAll(pagination);
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
    const user = await this.usersService.findOne(username);

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
}
