import { Controller, Get, Render, Res } from '@nestjs/common';
import express from 'express';

@Controller()
export class PagesController {
  @Get()
  @Render('home')
  getHome() {
    return { currentPath: '/', title: 'Generic Typing Test' };
  }

  @Get('play')
  @Render('play')
  getPlay() {
    return { currentPath: '/play', title: 'Play' };
  }

  @Get('leaderboard')
  @Render('leaderboard')
  getLeaderboard() {
    return { currentPath: '/leaderboard', title: 'Leaderboard' };
  }

  @Get('quote-submission')
  @Render('quote-submission')
  getQuoteSubmission() {
    return { currentPath: '/quote-submission', title: 'Submit a Quote' };
  }

  @Get('*')
  getNotFound(@Res() res: express.Response) {
    return res
      .status(404)
      .render('not-found', { currentPath: '', title: 'Page Not Found' });
  }
}
