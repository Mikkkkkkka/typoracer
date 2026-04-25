import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Req,
  Res,
} from '@nestjs/common';
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
    return this.renderDiscussionDetail(Number(discussionId), request, res);
  }

  @Post(':discussionId/replies')
  async createReply(
    @Param('discussionId') discussionId: string,
    @Body('text') text: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const normalizedText = text?.trim() ?? '';
    const numericDiscussionId = Number(discussionId);

    if (!normalizedText) {
      return this.renderDiscussionDetail(
        numericDiscussionId,
        request,
        response,
        {
          error: 'Reply text is required.',
          draftReplyText: text ?? '',
        },
      );
    }

    if (normalizedText.length > 2000) {
      return this.renderDiscussionDetail(
        numericDiscussionId,
        request,
        response,
        {
          error: 'Reply text must be 2000 characters or fewer.',
          draftReplyText: text ?? '',
        },
      );
    }

    const reply = await this.discussionsService.addReply(numericDiscussionId, {
      author: currentUser.username,
      text: normalizedText,
    });

    if (!reply) {
      return response.status(404).render('not-found', {
        currentPath: '',
        title: 'Discussion Not Found',
      });
    }

    return response.redirect(
      `/forums/${numericDiscussionId}?replyPosted=1#discussion-reply-form`,
    );
  }

  private async renderDiscussionDetail(
    discussionId: number,
    request: Request,
    res: Response,
    options?: {
      error?: string;
      draftReplyText?: string;
    },
  ) {
    const discussion =
      await this.discussionsService.getDiscussionById(discussionId);
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
      replyFormError: options?.error ?? this.getQueryMessage(request, 'error'),
      replyFormSuccess:
        request.query.replyPosted === '1' ? 'Reply posted.' : null,
      replyDraftText: options?.draftReplyText ?? '',
      discussion,
    });
  }

  private getQueryMessage(request: Request, key: string) {
    const value = request.query[key];
    return typeof value === 'string' ? value : null;
  }
}
