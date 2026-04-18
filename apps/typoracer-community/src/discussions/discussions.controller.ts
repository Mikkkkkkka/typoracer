import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Render,
  Res,
} from '@nestjs/common';
import express from 'express';
import { CreateDiscussionReply } from './discussions.models';
import { DiscussionsService } from './discussions.service';

@Controller('forums')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Get()
  @Render('forums')
  async getForumsPage() {
    return {
      currentPath: '/forums',
      title: 'Forums',
      discussions: await this.discussionsService.getDiscussions(),
    };
  }

  @Get(':discussionId')
  async getDiscussionDetail(
    @Param('discussionId') discussionId: string,
    @Headers('x-user') currentUser: string | undefined,
    @Res() res: express.Response,
  ) {
    const discussion = await this.discussionsService.getDiscussionById(
      Number(discussionId),
    );

    if (!discussion) {
      return res.status(404).render('not-found', {
        currentPath: '',
        title: 'Discussion Not Found',
      });
    }

    return res.render('discussion-detail', {
      currentPath: '/forums',
      title: discussion.title,
      currentUser: currentUser?.trim() || null,
      discussion,
    });
  }

  @Post(':discussionId/replies')
  @HttpCode(201)
  async createReply(
    @Param('discussionId') discussionId: string,
    @Headers('x-user') currentUserHeader: string | undefined,
    @Body() body: Partial<CreateDiscussionReply>,
  ) {
    const author = currentUserHeader?.trim() || body.author?.trim();
    const text = body.text?.trim();

    if (!author || !text) {
      throw new BadRequestException('Author and reply text are required.');
    }

    const reply = await this.discussionsService.addReply(Number(discussionId), {
      author,
      text,
    });

    if (!reply) {
      throw new NotFoundException('Discussion or author not found.');
    }

    return {
      reply,
    };
  }
}
