import { Controller, Get, Param, Render, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import express from 'express';
import { QuotesService } from './quotes.service';

@ApiExcludeController()
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @Render('quotes')
  async getQuotesPage() {
    return {
      currentPath: '/quotes',
      title: 'Search Quotes',
      quotes: (await this.quotesService.findAll()).slice(0, 60),
    };
  }

  @Get(':quoteId')
  async getQuoteDetail(
    @Param('quoteId') quoteId: string,
    @Res() res: express.Response,
  ) {
    const quote = await this.quotesService.findOne(Number(quoteId));

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
