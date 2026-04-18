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
import { CreateDiscussionReplyDto } from './dto/create-discussion-reply.dto';
import { DiscussionsService } from './discussions.service';

@Controller('api/discussions')
export class DiscussionsApiController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Get()
  findAll() {
    return this.discussionsService.getDiscussions();
  }

  @Get(':discussionId')
  async findOne(@Param('discussionId', ParseIntPipe) discussionId: number) {
    const discussion =
      await this.discussionsService.getDiscussionById(discussionId);

    if (!discussion) {
      throw new NotFoundException('Discussion not found.');
    }

    return discussion;
  }

  @Get(':discussionId/replies')
  async findReplies(@Param('discussionId', ParseIntPipe) discussionId: number) {
    const discussion =
      await this.discussionsService.getDiscussionById(discussionId);

    if (!discussion) {
      throw new NotFoundException('Discussion not found.');
    }

    return this.discussionsService.getReplies(discussionId);
  }

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
