import { Controller, Get, Render, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import express from 'express';

@ApiExcludeController()
@Controller()
export class PagesController {
  @Get()
  @Render('home')
  getHome() {
    return { currentPath: '/', title: 'Typoracer Community' };
  }

  @Get('leaderboard')
  @Render('leaderboard')
  getLeaderboard() {
    return {
      currentPath: '/leaderboard',
      title: 'Typoracer Leaderboard',
      users: [
        { name: 'SpeedyFox', wpm: 102, acc: 99 },
        { name: 'KeyMaster', wpm: 97, acc: 96 },
        { name: 'SwiftType', wpm: 93, acc: 95 },
      ],
    };
  }

  @Get('quote-submission')
  @Render('quote-submission')
  getQuoteSubmission() {
    return {
      currentPath: '/quote-submission',
      title: 'Typoracer Quote submission',
    };
  }

  @Get('*')
  getNotFound(@Res() res: express.Response) {
    return res.status(404).render('not-found', {
      currentPath: '',
      title: 'Page Not Found',
    });
  }
}
