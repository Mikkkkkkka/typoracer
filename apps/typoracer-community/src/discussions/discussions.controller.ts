import { Controller, Get, Param, Render, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { DiscussionsService } from './discussions.service';

@ApiExcludeController()
@Controller('forums')
export class DiscussionsController {
  constructor(
    private readonly discussionsService: DiscussionsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @Render('forums')
  async getForumsPage(@Req() request: Request) {
    return {
      currentPath: '/forums',
      title: 'Forums',
      currentUser: await this.authService.getCurrentUser(request),
      discussions: await this.discussionsService.getDiscussions(),
    };
  }

  @Get(':discussionId')
  async getDiscussionDetail(
    @Param('discussionId') discussionId: string,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const discussion = await this.discussionsService.getDiscussionById(
      Number(discussionId),
    );
    const currentUser = await this.authService.getCurrentUser(request);

    if (!discussion) {
      return res.status(404).render('not-found', {
        currentPath: '',
        title: 'Discussion Not Found',
      });
    }

    return res.render('discussion-detail', {
      currentPath: '/forums',
      title: discussion.title,
      currentUser,
      currentUsername: currentUser?.username ?? null,
      discussion,
    });
  }
}
