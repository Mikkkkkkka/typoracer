import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
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
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationLinkHeader } from '../common/pagination/pagination-links';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { CreateDiscussionReplyDto } from './dto/create-discussion-reply.dto';
import { DiscussionDto } from './dto/discussion.dto';
import { DiscussionReplyEnvelopeDto } from './dto/discussion-reply-envelope.dto';
import { DiscussionReplyDto } from './dto/discussion-reply.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { UpdateDiscussionReplyDto } from './dto/update-discussion-reply.dto';
import { DiscussionsService } from './discussions.service';

@ApiTags('discussions')
@Controller('api/discussions')
export class DiscussionsApiController {
  constructor(
    private readonly discussionsService: DiscussionsService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'List discussions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: DiscussionDto, isArray: true })
  @Get()
  async findAll(
    @Query() pagination: PaginationQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.discussionsService.getDiscussions(pagination);
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

  @ApiOperation({ summary: 'Create a discussion' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: DiscussionDto })
  @ApiBadRequestResponse({ description: 'Invalid discussion payload.' })
  @ApiNotFoundResponse({ description: 'Author was not found.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @Post()
  @HttpCode(201)
  async createDiscussion(
    @Body() body: CreateDiscussionDto,
    @Req() request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const discussion = await this.discussionsService.createDiscussion({
      author: currentUser.username,
      title: body.title,
      excerpt: body.excerpt,
      body: body.body,
    });

    if (!discussion) {
      throw new NotFoundException('Author not found.');
    }

    return discussion;
  }

  @ApiOperation({ summary: 'Update a discussion' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: DiscussionDto })
  @ApiBadRequestResponse({ description: 'Invalid discussion payload.' })
  @ApiForbiddenResponse({
    description: 'You can only edit your own discussions.',
  })
  @ApiNotFoundResponse({ description: 'Discussion was not found.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @Patch(':discussionId')
  async updateDiscussion(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() body: UpdateDiscussionDto,
    @Req() request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);

    try {
      const discussion = await this.discussionsService.updateDiscussion(
        discussionId,
        currentUser.username,
        body,
      );

      if (!discussion) {
        throw new NotFoundException('Discussion not found.');
      }

      return discussion;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw error;
    }
  }

  @ApiOperation({ summary: 'Delete a discussion' })
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Discussion deleted.' })
  @ApiForbiddenResponse({
    description: 'You can only delete your own discussions.',
  })
  @ApiNotFoundResponse({ description: 'Discussion was not found.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @Delete(':discussionId')
  @HttpCode(204)
  async deleteDiscussion(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Req() request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);

    try {
      const deleted = await this.discussionsService.deleteDiscussion(
        discussionId,
        currentUser.username,
      );

      if (!deleted) {
        throw new NotFoundException('Discussion not found.');
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw error;
    }
  }

  @ApiOperation({ summary: 'Get discussion details' })
  @ApiOkResponse({ type: DiscussionDto })
  @ApiNotFoundResponse({ description: 'Discussion was not found.' })
  @Get(':discussionId')
  async findOne(@Param('discussionId', ParseIntPipe) discussionId: number) {
    const discussion =
      await this.discussionsService.getDiscussionById(discussionId);

    if (!discussion) {
      throw new NotFoundException('Discussion not found.');
    }

    return discussion;
  }

  @ApiOperation({ summary: 'List replies for a discussion' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: DiscussionReplyDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Discussion was not found.' })
  @Get(':discussionId/replies')
  async findReplies(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Query() pagination: PaginationQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const discussion =
      await this.discussionsService.getDiscussionById(discussionId);

    if (!discussion) {
      throw new NotFoundException('Discussion not found.');
    }

    const result = await this.discussionsService.getReplies(
      discussionId,
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

  @ApiOperation({ summary: 'Get a discussion reply by id' })
  @ApiOkResponse({ type: DiscussionReplyDto })
  @ApiNotFoundResponse({ description: 'Reply was not found.' })
  @Get(':discussionId/replies/:replyId')
  async findReply(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('replyId', ParseIntPipe) replyId: number,
  ) {
    const reply = await this.discussionsService.getReplyById(
      discussionId,
      replyId,
    );

    if (!reply) {
      throw new NotFoundException('Reply not found.');
    }

    return reply;
  }

  @ApiOperation({ summary: 'Create a reply in a discussion' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: DiscussionReplyEnvelopeDto })
  @ApiBadRequestResponse({ description: 'Invalid reply payload.' })
  @ApiNotFoundResponse({ description: 'Discussion or author was not found.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @Post(':discussionId/replies')
  @HttpCode(201)
  async createReply(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() body: CreateDiscussionReplyDto,
    @Req() request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const reply = await this.discussionsService.addReply(discussionId, {
      author: currentUser.username,
      text: body.text,
    });

    if (!reply) {
      throw new NotFoundException('Discussion or author not found.');
    }

    return { reply };
  }

  @ApiOperation({ summary: 'Update a reply in a discussion' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: DiscussionReplyDto })
  @ApiBadRequestResponse({ description: 'Invalid reply payload.' })
  @ApiForbiddenResponse({
    description: 'You can only edit your own replies.',
  })
  @ApiNotFoundResponse({ description: 'Reply was not found.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @Patch(':discussionId/replies/:replyId')
  async updateReply(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('replyId', ParseIntPipe) replyId: number,
    @Body() body: UpdateDiscussionReplyDto,
    @Req() request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);

    try {
      const reply = await this.discussionsService.updateReply(
        discussionId,
        replyId,
        currentUser.username,
        body.text,
      );

      if (!reply) {
        throw new NotFoundException('Reply not found.');
      }

      return reply;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw error;
    }
  }
}
