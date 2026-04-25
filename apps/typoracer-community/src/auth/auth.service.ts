import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_TOKEN_TTL_SECONDS } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser, AuthTokenPayload } from './auth.types';

type UserRecord = {
  id: number;
  username: string;
  password: string;
};

type JwtHeader = {
  alg: string;
  typ: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(input: RegisterDto) {
    const username = input.username.trim();
    const existingUser = await this.findUserByUsername(username);

    if (existingUser) {
      throw new ConflictException('Username is already taken.');
    }

    const user = await this.prisma.user.create({
      data: {
        username,
        password: this.hashPassword(input.password),
        joinedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
      },
    });

    return this.createAuthResult(user);
  }

  async login(input: LoginDto) {
    const user = await this.findUserByUsername(input.username);

    if (!user || !this.verifyPassword(input.password, user.password)) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    return this.createAuthResult({
      id: user.id,
      username: user.username,
    });
  }

  async getCurrentUser(request: Request): Promise<AuthenticatedUser | null> {
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      return null;
    }

    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, username: true },
    });

    return user;
  }

  async requireCurrentUser(request: Request) {
    const user = await this.getCurrentUser(request);

    if (!user) {
      throw new UnauthorizedException('Authentication is required.');
    }

    return user;
  }

  signToken(user: AuthenticatedUser) {
    const now = Math.floor(Date.now() / 1000);
    const payload: AuthTokenPayload = {
      id: user.id,
      username: user.username,
      iat: now,
      exp: now + AUTH_TOKEN_TTL_SECONDS,
    };

    const encodedHeader = this.base64UrlEncode(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    );
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = this.base64UrlEncode(this.sign(unsignedToken));

    return `${unsignedToken}.${signature}`;
  }

  private createAuthResult(user: AuthenticatedUser) {
    return {
      accessToken: this.signToken(user),
      user,
    };
  }

  private async findUserByUsername(
    username: string,
  ): Promise<UserRecord | null> {
    return this.prisma.user.findFirst({
      where: {
        username: {
          equals: username.trim(),
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
        password: true,
      },
    });
  }

  private verifyToken(token: string): AuthTokenPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = this.sign(unsignedToken);
    const receivedSignature = this.base64UrlDecode(encodedSignature);

    if (
      receivedSignature.length !== expectedSignature.length ||
      !timingSafeEqual(receivedSignature, expectedSignature)
    ) {
      return null;
    }

    try {
      const header = this.parseJwtHeader(
        this.base64UrlDecode(encodedHeader).toString(),
      );
      if (header.alg !== 'HS256' || header.typ !== 'JWT') {
        return null;
      }

      const payload = this.parseJwtPayload(
        this.base64UrlDecode(encodedPayload).toString(),
      );
      if (!payload || payload.exp <= Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  private extractTokenFromRequest(request: Request) {
    const authorizationHeader = request.headers.authorization;
    if (authorizationHeader?.startsWith('Bearer ')) {
      return authorizationHeader.slice('Bearer '.length).trim();
    }

    const cookies = request.headers.cookie;
    if (!cookies) {
      return null;
    }

    for (const cookie of cookies.split(';')) {
      const [name, ...value] = cookie.trim().split('=');
      if (name === 'typoracer_auth') {
        return decodeURIComponent(value.join('='));
      }
    }

    return null;
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `scrypt$${salt}$${hash}`;
  }

  private verifyPassword(password: string, storedPassword: string) {
    if (!storedPassword.startsWith('scrypt$')) {
      return password === storedPassword;
    }

    const [, salt, storedHash] = storedPassword.split('$');
    const computedHash = scryptSync(password, salt, 64);
    const storedHashBuffer = Buffer.from(storedHash, 'hex');

    return (
      computedHash.length === storedHashBuffer.length &&
      timingSafeEqual(computedHash, storedHashBuffer)
    );
  }

  private sign(value: string) {
    return createHmac('sha256', this.getJwtSecret()).update(value).digest();
  }

  private getJwtSecret() {
    return process.env.JWT_SECRET || 'development-jwt-secret';
  }

  private base64UrlEncode(value: string | Buffer) {
    return Buffer.from(value).toString('base64url');
  }

  private base64UrlDecode(value: string) {
    return Buffer.from(value, 'base64url');
  }

  private parseJwtHeader(value: string): JwtHeader {
    const parsed: unknown = JSON.parse(value);

    if (!this.isJwtHeader(parsed)) {
      throw new Error('Invalid JWT header.');
    }

    return parsed;
  }

  private parseJwtPayload(value: string): AuthTokenPayload | null {
    const parsed: unknown = JSON.parse(value);

    if (!this.isAuthTokenPayload(parsed)) {
      return null;
    }

    return parsed;
  }

  private isJwtHeader(value: unknown): value is JwtHeader {
    return (
      typeof value === 'object' &&
      value !== null &&
      'alg' in value &&
      typeof value.alg === 'string' &&
      'typ' in value &&
      typeof value.typ === 'string'
    );
  }

  private isAuthTokenPayload(value: unknown): value is AuthTokenPayload {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      typeof value.id === 'number' &&
      'username' in value &&
      typeof value.username === 'string' &&
      'iat' in value &&
      typeof value.iat === 'number' &&
      'exp' in value &&
      typeof value.exp === 'number'
    );
  }
}
