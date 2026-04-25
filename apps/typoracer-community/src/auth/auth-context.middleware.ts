import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(request: Request, response: Response, next: NextFunction) {
    const currentUser = await this.authService.getCurrentUser(request);
    response.locals.currentUser = currentUser;
    next();
  }
}
