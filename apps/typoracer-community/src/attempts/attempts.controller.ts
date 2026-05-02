import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { QuotesService } from '../quotes/quotes.service';
import { AttemptsService } from './attempts.service';

type AttemptFormValues = {
  quoteId: string;
  wpm: string;
  accuracy: string;
  maxRawWpm: string;
};

@ApiExcludeController()
@Controller('attempts')
export class AttemptsController {
  constructor(
    private readonly attemptsService: AttemptsService,
    private readonly authService: AuthService,
    private readonly quotesService: QuotesService,
  ) {}

  @Get()
  async getAttemptsPage(@Req() request: Request, @Res() response: Response) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const attempts = await this.attemptsService.findDetailedByUser(
      currentUser.username,
    );

    return response.render('attempts', {
      currentPath: '/attempts',
      title: 'Attempts',
      currentUser,
      attempts: attempts.map((attempt) => ({
        ...attempt,
        createdAt: this.formatLongDate(attempt.createdAt),
      })),
      attemptCreated: request.query.created === '1',
      attemptDeleted: request.query.deleted === '1',
    });
  }

  @Get('new')
  async getCreateAttemptPage(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    await this.authService.requireCurrentUser(request);
    return this.renderCreateAttemptPage(request, response);
  }

  @Post()
  async createAttempt(
    @Body() body: Record<string, string | undefined>,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const form = this.normalizeForm(body);
    const validationError = this.validateForm(form);

    if (validationError) {
      return this.renderCreateAttemptPage(request, response, {
        error: validationError,
        form,
      });
    }

    const attempt = await this.attemptsService.create({
      quoteId: Number(form.quoteId),
      userId: currentUser.id,
      wpm: Number(form.wpm),
      accuracy: Number(form.accuracy),
      maxRawWpm: form.maxRawWpm ? Number(form.maxRawWpm) : Number(form.wpm),
    });

    return response.redirect(`/attempts/${attempt.id}?created=1`);
  }

  @Get(':attemptId')
  async getAttemptDetail(
    @Param('attemptId') attemptId: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const attempt = await this.getOwnedAttempt(
      Number(attemptId),
      currentUser.id,
    );

    if (!attempt) {
      return response.status(404).render('not-found', {
        currentPath: '',
        title: 'Attempt Not Found',
        currentUser,
      });
    }

    return response.render('attempt-detail', {
      currentPath: '/attempts',
      title: `Attempt ${attempt.id}`,
      currentUser,
      attempt: {
        ...attempt,
        createdAt: this.formatLongDate(attempt.createdAt),
      },
      attemptCreated: request.query.created === '1',
      attemptUpdated: request.query.updated === '1',
    });
  }

  @Get(':attemptId/edit')
  async getEditAttemptPage(
    @Param('attemptId') attemptId: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    await this.authService.requireCurrentUser(request);
    return this.renderEditAttemptPage(Number(attemptId), request, response);
  }

  @Post(':attemptId/edit')
  async updateAttempt(
    @Param('attemptId') attemptId: string,
    @Body() body: Record<string, string | undefined>,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const numericAttemptId = Number(attemptId);
    const ownedAttempt = await this.getOwnedAttempt(
      numericAttemptId,
      currentUser.id,
    );

    if (!ownedAttempt) {
      return response.status(404).render('not-found', {
        currentPath: '',
        title: 'Attempt Not Found',
        currentUser,
      });
    }

    const form = this.normalizeForm(body);
    const validationError = this.validateForm(form);

    if (validationError) {
      return this.renderEditAttemptPage(numericAttemptId, request, response, {
        error: validationError,
        form,
      });
    }

    await this.attemptsService.update(numericAttemptId, {
      quoteId: Number(form.quoteId),
      userId: currentUser.id,
      wpm: Number(form.wpm),
      accuracy: Number(form.accuracy),
      maxRawWpm: form.maxRawWpm ? Number(form.maxRawWpm) : Number(form.wpm),
    });

    return response.redirect(`/attempts/${numericAttemptId}?updated=1`);
  }

  @Post(':attemptId/delete')
  async deleteAttempt(
    @Param('attemptId') attemptId: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const numericAttemptId = Number(attemptId);
    const ownedAttempt = await this.getOwnedAttempt(
      numericAttemptId,
      currentUser.id,
    );

    if (!ownedAttempt) {
      return response.status(404).render('not-found', {
        currentPath: '',
        title: 'Attempt Not Found',
        currentUser,
      });
    }

    await this.attemptsService.remove(numericAttemptId);

    return response.redirect('/attempts?deleted=1');
  }

  private async renderCreateAttemptPage(
    request: Request,
    response: Response,
    options?: {
      error?: string;
      form?: AttemptFormValues;
    },
  ) {
    const currentUser = await this.authService.getCurrentUser(request);

    if (!currentUser) {
      return response.redirect('/auth/login');
    }

    return response.render('create-attempt', {
      currentPath: '/attempts',
      title: 'Add Attempt',
      currentUser,
      quotes: await this.quotesService.findAll(),
      formValues: options?.form ?? {
        quoteId: '',
        wpm: '',
        accuracy: '',
        maxRawWpm: '',
      },
      attemptFormError:
        options?.error ?? this.getQueryMessage(request, 'error'),
    });
  }

  private async renderEditAttemptPage(
    attemptId: number,
    request: Request,
    response: Response,
    options?: {
      error?: string;
      form?: AttemptFormValues;
    },
  ) {
    const currentUser = await this.authService.getCurrentUser(request);

    if (!currentUser) {
      return response.redirect('/auth/login');
    }

    const attempt = await this.getOwnedAttempt(attemptId, currentUser.id);

    if (!attempt) {
      return response.status(404).render('not-found', {
        currentPath: '',
        title: 'Attempt Not Found',
        currentUser,
      });
    }

    return response.render('edit-attempt', {
      currentPath: '/attempts',
      title: `Edit Attempt ${attempt.id}`,
      currentUser,
      attempt,
      quotes: await this.quotesService.findAll(),
      formValues: options?.form ?? {
        quoteId: String(attempt.quoteId),
        wpm: String(attempt.wpm),
        accuracy: String(attempt.accuracy),
        maxRawWpm: String(attempt.maxRawWpm),
      },
      attemptFormError:
        options?.error ?? this.getQueryMessage(request, 'error'),
    });
  }

  private async getOwnedAttempt(attemptId: number, userId: number) {
    if (!Number.isInteger(attemptId) || attemptId <= 0) {
      return null;
    }

    try {
      const attempt = await this.attemptsService.findDetailedOne(attemptId);
      return attempt.userId === userId ? attempt : null;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }

      throw error;
    }
  }

  private normalizeForm(
    body: Record<string, string | undefined>,
  ): AttemptFormValues {
    return {
      quoteId: body.quoteId?.trim() ?? '',
      wpm: body.wpm?.trim() ?? '',
      accuracy: body.accuracy?.trim() ?? '',
      maxRawWpm: body.maxRawWpm?.trim() ?? '',
    };
  }

  private validateForm(form: AttemptFormValues) {
    const quoteId = Number(form.quoteId);
    const wpm = Number(form.wpm);
    const accuracy = Number(form.accuracy);
    const maxRawWpm = form.maxRawWpm ? Number(form.maxRawWpm) : wpm;

    if (!Number.isInteger(quoteId) || quoteId <= 0) {
      return 'Choose a quote from the list.';
    }

    if (!Number.isFinite(wpm) || wpm <= 0) {
      return 'WPM must be a positive number.';
    }

    if (!Number.isFinite(accuracy) || accuracy <= 0 || accuracy > 100) {
      return 'Accuracy must be between 0 and 100.';
    }

    if (!Number.isFinite(maxRawWpm) || maxRawWpm <= 0) {
      return 'Max raw WPM must be a positive number.';
    }

    return null;
  }

  private getQueryMessage(request: Request, key: string) {
    const value = request.query[key];
    return typeof value === 'string' ? value : null;
  }

  private formatLongDate(value: string) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  }
}
