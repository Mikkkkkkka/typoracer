import { Controller, Get, Param, Res } from '@nestjs/common';
import express from 'express';
import { DiscussionsService } from '../discussions/discussions.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly discussionsService: DiscussionsService,
  ) {}

  @Get(':username')
  getUserProfile(
    @Param('username') username: string,
    @Res() res: express.Response,
  ) {
    const user = this.usersService.getUserByUsername(username);

    if (!user) {
      return res.status(404).render('not-found', {
        currentPath: '',
        title: 'User Not Found',
      });
    }

    return res.render('user-profile', {
      currentPath: '',
      title: user.username,
      user,
      userDiscussions: this.discussionsService.getDiscussionsByAuthor(
        user.username,
      ),
    });
  }
}
