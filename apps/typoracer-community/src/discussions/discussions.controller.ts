import {
  Body,
  Controller,
  ForbiddenException,
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
import { CreateDiscussionFormDto } from './dto/create-discussion-form.dto';
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
      discussionCreated: request.query.created === '1',
      discussions: await this.discussionsService.getDiscussions(),
    };
  }

  @Get('new')
  async getCreateDiscussionPage(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    await this.authService.requireCurrentUser(request);
    return this.renderCreateDiscussionPage(request, response);
  }

  @Post()
  async createDiscussion(
    @Body() body: CreateDiscussionFormDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const form = this.normalizeDiscussionForm(body);
    const validationError = this.validateDiscussionForm(form);

    if (validationError) {
      return this.renderCreateDiscussionPage(request, response, {
        error: validationError,
        form,
      });
    }

    const discussion = await this.discussionsService.createDiscussion({
      author: currentUser.username,
      title: form.title,
      excerpt: form.excerpt,
      body: form.body,
    });

    if (!discussion) {
      return this.renderCreateDiscussionPage(request, response, {
        error: 'Unable to create discussion.',
        form,
      });
    }

    return response.redirect(`/forums/${discussion.id}?created=1`);
  }

  @Get(':discussionId')
  async getDiscussionDetail(
    @Param('discussionId') discussionId: string,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    return this.renderDiscussionDetail(Number(discussionId), request, res);
  }

  @Get(':discussionId/edit')
  async getEditDiscussionPage(
    @Param('discussionId') discussionId: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    await this.authService.requireCurrentUser(request);
    return this.renderEditDiscussionPage(Number(discussionId), request, response);
  }

  @Post(':discussionId/edit')
  async updateDiscussion(
    @Param('discussionId') discussionId: string,
    @Body() body: CreateDiscussionFormDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const numericDiscussionId = Number(discussionId);
    const form = this.normalizeDiscussionForm(body);
    const validationError = this.validateDiscussionForm(form);

    if (validationError) {
      return this.renderEditDiscussionPage(
        numericDiscussionId,
        request,
        response,
        {
          error: validationError,
          form,
        },
      );
    }

    try {
      const discussion = await this.discussionsService.updateDiscussion(
        numericDiscussionId,
        currentUser.username,
        form,
      );

      if (!discussion) {
        return response.status(404).render('not-found', {
          currentPath: '',
          title: 'Discussion Not Found',
        });
      }

      return response.redirect(`/forums/${discussion.id}?updated=1`);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        return response.redirect(
          `/forums/${numericDiscussionId}?error=${encodeURIComponent(error.message)}`,
        );
      }

      throw error;
    }
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
      discussionCreated: request.query.created === '1',
      discussionUpdated: request.query.updated === '1',
      replyFormError: options?.error ?? this.getQueryMessage(request, 'error'),
      replyFormSuccess:
        request.query.replyPosted === '1' ? 'Reply posted.' : null,
      replyDraftText: options?.draftReplyText ?? '',
      discussion,
    });
  }

  private async renderEditDiscussionPage(
    discussionId: number,
    request: Request,
    response: Response,
    options?: {
      error?: string;
      form?: {
        title: string;
        excerpt: string;
        body: string;
      };
    },
  ) {
    const [discussion, currentUser] = await Promise.all([
      this.discussionsService.getDiscussionById(discussionId),
      this.authService.getCurrentUser(request),
    ]);

    if (!discussion) {
      return response.status(404).render('not-found', {
        currentPath: '',
        title: 'Discussion Not Found',
      });
    }

    if (
      !currentUser ||
      currentUser.username.toLowerCase() !== discussion.author.toLowerCase()
    ) {
      return response.redirect(
        `/forums/${discussionId}?error=${encodeURIComponent('You can only edit your own discussions.')}`,
      );
    }

    return response.render('edit-discussion', {
      currentPath: '/forums',
      title: `Edit ${discussion.title}`,
      currentUser,
      discussion,
      discussionFormError:
        options?.error ?? this.getQueryMessage(request, 'error'),
      formValues: options?.form ?? {
        title: discussion.title,
        excerpt: discussion.excerpt,
        body: discussion.body,
      },
    });
  }

  private async renderCreateDiscussionPage(
    request: Request,
    response: Response,
    options?: {
      error?: string;
      form?: {
        title: string;
        excerpt: string;
        body: string;
      };
    },
  ) {
    return response.render('create-discussion', {
      currentPath: '/forums',
      title: 'Start Discussion',
      currentUser: await this.authService.getCurrentUser(request),
      discussionFormError: options?.error ?? this.getQueryMessage(request, 'error'),
      formValues: options?.form ?? {
        title: '',
        excerpt: '',
        body: '',
      },
    });
  }

  private normalizeDiscussionForm(body: CreateDiscussionFormDto) {
    return {
      title: body.title?.trim() ?? '',
      excerpt: body.excerpt?.trim() ?? '',
      body: body.body?.trim() ?? '',
    };
  }

  private validateDiscussionForm(form: {
    title: string;
    excerpt: string;
    body: string;
  }) {
    if (!form.title) {
      return 'Title is required.';
    }

    if (form.title.length > 120) {
      return 'Title must be 120 characters or fewer.';
    }

    if (!form.excerpt) {
      return 'Excerpt is required.';
    }

    if (form.excerpt.length > 240) {
      return 'Excerpt must be 240 characters or fewer.';
    }

    if (!form.body) {
      return 'Discussion body is required.';
    }

    if (form.body.length > 5000) {
      return 'Discussion body must be 5000 characters or fewer.';
    }

    return null;
  }

  private getQueryMessage(request: Request, key: string) {
    const value = request.query[key];
    return typeof value === 'string' ? value : null;
  }
}
