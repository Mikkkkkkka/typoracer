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
    return { currentPath: '/play', title: 'Play Typing Test' };
  }

  @Get('leaderboard')
  @Render('leaderboard')
  getLeaderboard() {
    return { currentPath: '/leaderboard', title: 'Generic Leaderboard' };
  }

  @Get('quote-submission')
  @Render('quote-submission')
  getQuoteSubmission() {
    return {
      currentPath: '/quote-submission',
      title: 'Generic Quote Submission',
    };
  }

  @Get('*')
  getNotFound(@Res() res: express.Response) {
    return res.status(404).render('not-found', {
      currentPath: '',
      title: 'Generic Page Not Found',
    });
  }
}
