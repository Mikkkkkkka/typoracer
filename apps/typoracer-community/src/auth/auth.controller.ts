import { Body, Controller, Get, Post, Render, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AUTH_COOKIE_NAME, AUTH_TOKEN_TTL_SECONDS } from './auth.constants';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiExcludeController()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @Render('auth/login')
  async getLogin(@Req() request: Request) {
    return {
      currentPath: '/auth/login',
      title: 'Sign In',
      currentUser: await this.authService.getCurrentUser(request),
    };
  }

  @Get('register')
  @Render('auth/register')
  async getRegister(@Req() request: Request) {
    return {
      currentPath: '/auth/register',
      title: 'Create Account',
      currentUser: await this.authService.getCurrentUser(request),
    };
  }

  @Post('login')
  async login(@Body() input: LoginDto, @Res() response: Response) {
    const result = await this.authService.login(input);
    this.setAuthCookie(response, result.accessToken);
    return response.redirect('/');
  }

  @Post('register')
  async register(@Body() input: RegisterDto, @Res() response: Response) {
    const result = await this.authService.register(input);
    this.setAuthCookie(response, result.accessToken);
    return response.redirect('/');
  }

  @Post('logout')
  logout(@Res() response: Response) {
    this.clearAuthCookie(response);
    return response.redirect('/');
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
