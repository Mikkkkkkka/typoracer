import {
  Body,
  ConflictException,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import {
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_TTL_SECONDS,
} from '../auth/auth.constants';
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

  @Get('me/edit')
  async getCurrentUserEditProfile(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    return response.redirect(
      `/users/${encodeURIComponent(currentUser.username)}/edit`,
    );
  }

  @Get(':username')
  async getUserProfile(
    @Param('username') username: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return this.renderUserProfile(username, request, response);
  }

  @Get(':username/edit')
  async getEditUserProfile(
    @Param('username') username: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);

    if (currentUser.username.toLowerCase() !== username.trim().toLowerCase()) {
      return response.redirect(
        `/users/${encodeURIComponent(username)}?error=${encodeURIComponent('You can only edit your own profile.')}`,
      );
    }

    return this.renderEditProfile(username, request, response);
  }

  @Post(':username/edit')
  async updateUserProfile(
    @Param('username') username: string,
    @Body() body: Record<string, string | undefined>,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);

    if (currentUser.username.toLowerCase() !== username.trim().toLowerCase()) {
      return response.redirect(
        `/users/${encodeURIComponent(username)}?error=${encodeURIComponent('You can only edit your own profile.')}`,
      );
    }

    const form = this.normalizeProfileForm(body);
    const validationError = this.validateProfileForm(form);

    if (validationError) {
      return this.renderEditProfile(username, request, response, {
        error: validationError,
        form,
      });
    }

    try {
      const user = await this.usersService.updateDetails(username, {
        username: form.username,
        bio: form.bio ? form.bio : null,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      });

      if (!user) {
        return response.status(404).render('not-found', {
          currentPath: '',
          title: 'User Not Found',
        });
      }

      this.setAuthCookie(
        response,
        this.authService.signToken({
          id: currentUser.id,
          username: user.username,
        }),
      );

      return response.redirect(
        `/users/${encodeURIComponent(user.username)}/edit?updated=1`,
      );
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof UnauthorizedException
      ) {
        return this.renderEditProfile(username, request, response, {
          error: error.message,
          form,
        });
      }

      throw error;
    }
  }

  @Post(':username/delete')
  async deleteUserProfile(
    @Param('username') username: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);

    if (currentUser.username.toLowerCase() !== username.trim().toLowerCase()) {
      return response.redirect(
        `/users/${encodeURIComponent(username)}?error=${encodeURIComponent('You can only delete your own profile.')}`,
      );
    }

    const deleted = await this.usersService.deleteByUsername(username);

    if (!deleted) {
      return response.status(404).render('not-found', {
        currentPath: '',
        title: 'User Not Found',
      });
    }

    this.clearAuthCookie(response);
    return response.redirect('/?accountDeleted=1');
  }

  private async renderEditProfile(
    username: string,
    request: Request,
    response: Response,
    options?: {
      error?: string;
      form?: {
        username: string;
        bio: string;
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
      };
    },
  ) {
    const [user, viewer] = await Promise.all([
      this.usersService.findOne(username),
      this.authService.getCurrentUser(request),
    ]);

    if (!user) {
      return response.status(404).render('not-found', {
        currentPath: '',
        title: 'User Not Found',
      });
    }

    const isOwnProfile =
      viewer?.username.toLowerCase() === user.username.toLowerCase();

    if (!isOwnProfile) {
      return response.redirect(
        `/users/${encodeURIComponent(user.username)}?error=${encodeURIComponent('You can only edit your own profile.')}`,
      );
    }

    return response.render('edit-user-profile', {
      currentPath: '',
      title: `Edit ${user.username}`,
      currentUser: viewer,
      user,
      profileFormError:
        options?.error ?? this.getQueryMessage(request, 'error'),
      profileFormSuccess:
        request.query.updated === '1' ? 'Profile updated.' : null,
      formValues: options?.form ?? {
        username: user.username,
        bio: user.bio ?? '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      },
    });
  }

  private async renderUserProfile(
    username: string,
    request: Request,
    response: Response,
  ) {
    const [user, viewer] = await Promise.all([
      this.usersService.findOne(username),
      this.authService.getCurrentUser(request),
    ]);

    if (!user) {
      return response.status(404).render('not-found', {
        currentPath: '',
        title: 'User Not Found',
      });
    }

    return response.render('user-profile', {
      currentPath: '',
      title: user.username,
      currentUser: viewer,
      user,
      isOwnProfile:
        viewer?.username.toLowerCase() === user.username.toLowerCase(),
      profileFormError: this.getQueryMessage(request, 'error'),
      profileFormSuccess:
        request.query.updated === '1' ? 'Profile updated.' : null,
      userDiscussions: await this.discussionsService.getDiscussionsByAuthor(
        user.username,
      ),
    });
  }

  private normalizeProfileForm(body: Record<string, string | undefined>) {
    return {
      username: body.username?.trim() ?? '',
      bio: body.bio ?? '',
      currentPassword: body.currentPassword ?? '',
      newPassword: body.newPassword ?? '',
      confirmNewPassword: body.confirmNewPassword ?? '',
    };
  }

  private validateProfileForm(form: {
    username: string;
    bio: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) {
    if (form.username.length < 3 || form.username.length > 32) {
      return 'Username must be between 3 and 32 characters.';
    }

    if (form.bio.length > 500) {
      return 'Bio must be 500 characters or fewer.';
    }

    if (!form.newPassword && form.currentPassword) {
      return 'Enter a new password to change your password.';
    }

    if (form.newPassword && form.newPassword.length < 8) {
      return 'New password must be at least 8 characters long.';
    }

    if (form.newPassword && !form.currentPassword) {
      return 'Enter your current password to set a new password.';
    }

    if (form.newPassword && form.newPassword !== form.confirmNewPassword) {
      return 'New password and confirmation must match.';
    }

    return null;
  }

  private getQueryMessage(request: Request, key: string) {
    const value = request.query[key];
    return typeof value === 'string' ? value : null;
  }

  private setAuthCookie(response: Response, token: string) {
    response.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: AUTH_TOKEN_TTL_SECONDS * 1000,
      path: '/',
    });
  }

  private clearAuthCookie(response: Response) {
    response.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }
}
