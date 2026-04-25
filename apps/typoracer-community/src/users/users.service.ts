import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import {
  PaginatedResult,
  PaginationParams,
} from '../common/pagination/pagination.models';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserProfile } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async findAll(): Promise<User[]>;
  async findAll(pagination: PaginationParams): Promise<PaginatedResult<User>>;
  async findAll(
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<User> | User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { id: 'asc' },
      skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
      take: pagination ? pagination.limit + 1 : undefined,
      select: {
        username: true,
        joinedAt: true,
        bio: true,
      },
    });

    const mappedUsers = users.map((user) => ({
      username: user.username,
      joinedAt: this.formatMonthYear(user.joinedAt),
      bio: user.bio,
    }));

    if (!pagination) {
      return mappedUsers;
    }

    return {
      items: mappedUsers.slice(0, pagination.limit),
      hasNextPage: mappedUsers.length > pagination.limit,
    };
  }

  async findOne(username: string): Promise<UserProfile | undefined> {
    const user = await this.prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
      include: {
        attempts: {
          select: {
            accuracy: true,
            wpm: true,
          },
        },
        _count: {
          select: {
            discussions: true,
          },
        },
      },
    });

    if (!user) {
      return undefined;
    }

    const bestWpm = user.attempts.reduce(
      (currentBest, attempt) => Math.max(currentBest, attempt.wpm),
      0,
    );
    const averageAccuracy =
      user.attempts.length === 0
        ? 0
        : user.attempts.reduce(
            (total, attempt) => total + attempt.accuracy,
            0,
          ) / user.attempts.length;

    return {
      username: user.username,
      joinedAt: this.formatMonthYear(user.joinedAt),
      bio: user.bio,
      stats: {
        wpm: Math.round(bestWpm),
        accuracy: Math.round(averageAccuracy),
        discussions: user._count.discussions,
      },
    };
  }

  async update(
    username: string,
    updateUser: UpdateUserDto,
  ): Promise<UserProfile | undefined> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
      },
    });

    if (!existingUser) {
      return undefined;
    }

    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: {
        bio:
          updateUser.bio === undefined
            ? undefined
            : updateUser.bio?.trim() || null,
      },
    });

    return this.findOne(username);
  }

  async updateDetails(
    username: string,
    updateUser: {
      username: string;
      bio: string | null;
      currentPassword?: string;
      newPassword?: string;
    },
  ): Promise<UserProfile | undefined> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!existingUser) {
      return undefined;
    }

    const nextUsername = updateUser.username.trim();
    const nextBio = updateUser.bio?.trim() || null;

    const conflictingUser = await this.prisma.user.findFirst({
      where: {
        id: { not: existingUser.id },
        username: {
          equals: nextUsername,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
      },
    });

    if (conflictingUser) {
      throw new ConflictException('Username is already taken.');
    }

    let nextPassword: string | undefined;

    if (updateUser.newPassword) {
      if (
        !updateUser.currentPassword ||
        !this.authService.verifyPasswordAgainstStoredHash(
          updateUser.currentPassword,
          existingUser.password,
        )
      ) {
        throw new UnauthorizedException('Current password is incorrect.');
      }

      nextPassword = this.authService.hashPasswordForStorage(
        updateUser.newPassword,
      );
    }

    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: {
        username: nextUsername,
        bio: nextBio,
        password: nextPassword,
      },
    });

    return this.findOne(nextUsername);
  }

  private formatMonthYear(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
}
