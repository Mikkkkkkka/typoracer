import { Controller, Get, Headers, Param, Render, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import express from 'express';
import { DiscussionsService } from './discussions.service';

@ApiExcludeController()
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
}
