import {
  Body,
  Controller,
  Get,
  HttpCode,
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
import { CreateDiscussionReplyDto } from './dto/create-discussion-reply.dto';
import { DiscussionDto } from './dto/discussion.dto';
import { DiscussionReplyEnvelopeDto } from './dto/discussion-reply-envelope.dto';
import { DiscussionReplyDto } from './dto/discussion-reply.dto';
import { DiscussionsService } from './discussions.service';

@ApiTags('discussions')
@Controller('api/discussions')
export class DiscussionsApiController {
  constructor(private readonly discussionsService: DiscussionsService) {}

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
  @ApiCreatedResponse({ type: DiscussionReplyEnvelopeDto })
  @ApiBadRequestResponse({ description: 'Invalid reply payload.' })
  @ApiNotFoundResponse({ description: 'Discussion or author was not found.' })
  @Post(':discussionId/replies')
  @HttpCode(201)
  async createReply(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() body: CreateDiscussionReplyDto,
  ) {
    const reply = await this.discussionsService.addReply(discussionId, {
      author: body.author,
      text: body.text,
    });

    if (!reply) {
      throw new NotFoundException('Discussion or author not found.');
    }

    return { reply };
  }
}
