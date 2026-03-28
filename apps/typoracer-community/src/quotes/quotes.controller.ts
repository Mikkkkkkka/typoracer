import { Controller, Get, Param, Render, Res } from '@nestjs/common';
import express from 'express';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @Render('quotes')
  getQuotesPage() {
    return {
      currentPath: '/quotes',
      title: 'Search Quotes',
      quotes: this.quotesService.getQuotes().slice(0, 60),
    };
  }

  @Get(':quoteId')
  getQuoteDetail(
    @Param('quoteId') quoteId: string,
    @Res() res: express.Response,
  ) {
    const quote = this.quotesService.getQuoteById(Number(quoteId));

    if (!quote) {
      return res.status(404).render('not-found', {
        currentPath: '',
        title: 'Quote Not Found',
      });
    }

    return res.render('quote-detail', {
      currentPath: '/quotes',
      title: `Quote ${quote.id}`,
      quote,
    });
  }
}
