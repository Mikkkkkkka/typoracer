import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';

@ApiExcludeController()
@Controller()
export class PagesController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @Render('home')
  async getHome(@Req() request: Request) {
    return {
      currentPath: '/',
      title: 'Typoracer Community',
      currentUser: await this.authService.getCurrentUser(request),
      accountDeleted: request.query.accountDeleted === '1',
    };
  }

  @Get('leaderboard')
  @Render('leaderboard')
  async getLeaderboard(@Req() request: Request) {
    return {
      currentPath: '/leaderboard',
      title: 'Typoracer Leaderboard',
      currentUser: await this.authService.getCurrentUser(request),
      users: [
        { name: 'SpeedyFox', wpm: 102, acc: 99 },
        { name: 'KeyMaster', wpm: 97, acc: 96 },
        { name: 'SwiftType', wpm: 93, acc: 95 },
      ],
    };
  }

  @Get('quote-submission')
  @Render('quote-submission')
  async getQuoteSubmission(@Req() request: Request) {
    return {
      currentPath: '/quote-submission',
      title: 'Typoracer Quote submission',
      currentUser: await this.authService.getCurrentUser(request),
    };
  }

  @Get('*')
  async getNotFound(@Req() request: Request, @Res() res: Response) {
    return res.status(404).render('not-found', {
      currentPath: '',
      title: 'Page Not Found',
      currentUser: await this.authService.getCurrentUser(request),
    });
  }
}
