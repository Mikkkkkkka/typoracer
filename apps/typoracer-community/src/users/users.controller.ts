import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { DiscussionsService } from '../discussions/discussions.service';
import { UsersService } from './users.service';

@ApiExcludeController()
@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly discussionsService: DiscussionsService,
  ) {}

  @Get('me')
  async getCurrentUserProfile(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    return response.redirect(
      `/users/${encodeURIComponent(currentUser.username)}`,
    );
  }

  @Get(':username')
  async getUserProfile(
    @Param('username') username: string,
    @Res() res: Response,
  ) {
    const user = await this.usersService.findOne(username);

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
      userDiscussions: await this.discussionsService.getDiscussionsByAuthor(
        user.username,
      ),
    });
  }
}
