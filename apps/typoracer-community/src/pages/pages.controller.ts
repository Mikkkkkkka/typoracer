import { Controller, Get, Next, Render, Req, Res } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

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
  getNotFound(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    // Let Apollo handle the GraphQL sandbox and introspection GET requests.
    if (req.path === '/graphql') {
      return next();
    }

    return res.status(404).render('not-found', {
      currentPath: '',
      title: 'Page Not Found',
    });
  }
}
