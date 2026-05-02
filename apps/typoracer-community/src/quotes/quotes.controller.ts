import { Controller, Get, Param, Render, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { QuotesService } from './quotes.service';

@ApiExcludeController()
@Controller('quotes')
export class QuotesController {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @Render('quotes')
  async getQuotesPage(@Req() request: Request) {
    return {
      currentPath: '/quotes',
      title: 'Search Quotes',
      currentUser: await this.authService.getCurrentUser(request),
      quotes: (await this.quotesService.findAll()).slice(0, 60),
    };
  }

  @Get('submit')
  @Render('quote-submission')
  async getQuoteSubmission(@Req() request: Request) {
    return {
      currentPath: '/quotes',
      title: 'Typoracer Quote submission',
      currentUser: await this.authService.getCurrentUser(request),
    };
  }

  @Get(':quoteId')
  async getQuoteDetail(
    @Param('quoteId') quoteId: string,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const quote = await this.quotesService.findOne(Number(quoteId));

    if (!quote) {
      return res.status(404).render('not-found', {
        currentPath: '',
        title: 'Quote Not Found',
        currentUser: await this.authService.getCurrentUser(request),
      });
    }

    return res.render('quote-detail', {
      currentPath: '/quotes',
      title: `Quote ${quote.id}`,
      currentUser: await this.authService.getCurrentUser(request),
      quote,
    });
  }
}
