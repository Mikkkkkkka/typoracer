import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  DiscussionDto,
  DiscussionReplyDto,
  DiscussionReplyEnvelopeDto,
} from './discussions-api.models';
import { CreateDiscussionReplyDto } from './dto/create-discussion-reply.dto';
import { DiscussionsService } from './discussions.service';

@ApiTags('discussions')
@Controller('api/discussions')
export class DiscussionsApiController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @ApiOperation({ summary: 'List discussions' })
  @ApiOkResponse({ type: DiscussionDto, isArray: true })
  @Get()
  findAll() {
    return this.discussionsService.getDiscussions();
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
  @ApiOkResponse({ type: DiscussionReplyDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Discussion was not found.' })
  @Get(':discussionId/replies')
  async findReplies(@Param('discussionId', ParseIntPipe) discussionId: number) {
    const discussion =
      await this.discussionsService.getDiscussionById(discussionId);

    if (!discussion) {
      throw new NotFoundException('Discussion not found.');
    }

    return this.discussionsService.getReplies(discussionId);
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
