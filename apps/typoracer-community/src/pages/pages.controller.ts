import { Controller, Get, Query, Render, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UsersService } from '../users/users.service';

@ApiExcludeController()
@Controller()
export class PagesController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

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
  async getLeaderboard(
    @Req() request: Request,
    @Query() pagination: PaginationQueryDto,
  ) {
    const leaderboard = await this.usersService.findLeaderboard(pagination);

    return {
      currentPath: '/leaderboard',
      title: 'Typoracer Leaderboard',
      currentUser: await this.authService.getCurrentUser(request),
      users: leaderboard.items.map((user) => ({
        name: user.username,
        wpm: user.wpm,
        acc: user.accuracy,
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        hasPreviousPage: pagination.page > 1,
        hasNextPage: leaderboard.hasNextPage,
      },
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
