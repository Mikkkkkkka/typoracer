import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PaginatedResult,
  PaginationParams,
} from '../common/pagination/pagination.models';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDiscussionReply,
  Discussion,
  DiscussionReply,
} from './entities/discussion.entity';

@Injectable()
export class DiscussionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDiscussions(): Promise<Discussion[]>;
  async getDiscussions(
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Discussion>>;
  async getDiscussions(
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Discussion> | Discussion[]> {
    const discussions = await this.prisma.discussion.findMany({
      orderBy: { id: 'asc' },
      skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
      take: pagination ? pagination.limit + 1 : undefined,
      include: {
        author: {
          select: {
            username: true,
          },
        },
        replies: {
          orderBy: { id: 'asc' },
          include: {
            author: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    const mappedDiscussions = discussions.map((discussion) =>
      this.mapDiscussion(discussion),
    );

    if (!pagination) {
      return mappedDiscussions;
    }

    return {
      items: mappedDiscussions.slice(0, pagination.limit),
      hasNextPage: mappedDiscussions.length > pagination.limit,
    };
  }

  async getDiscussionById(
    discussionId: number,
  ): Promise<Discussion | undefined> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      include: {
        author: {
          select: {
            username: true,
          },
        },
        replies: {
          orderBy: { id: 'asc' },
          include: {
            author: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    return discussion ? this.mapDiscussion(discussion) : undefined;
  }

  async getReplies(discussionId: number): Promise<DiscussionReply[]>;
  async getReplies(
    discussionId: number,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<DiscussionReply>>;
  async getReplies(
    discussionId: number,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<DiscussionReply> | DiscussionReply[]> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { id: true },
    });

    if (!discussion) {
      return [];
    }

    const replies = await this.prisma.discussionReply.findMany({
      where: { discussionId },
      orderBy: { id: 'asc' },
      skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
      take: pagination ? pagination.limit + 1 : undefined,
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    const mappedReplies = replies.map((reply) => ({
      author: reply.author.username,
      text: reply.text,
    }));

    if (!pagination) {
      return mappedReplies;
    }

    return {
      items: mappedReplies.slice(0, pagination.limit),
      hasNextPage: mappedReplies.length > pagination.limit,
    };
  }

  async getReplyById(
    discussionId: number,
    replyId: number,
  ): Promise<DiscussionReply | undefined> {
    const reply = await this.prisma.discussionReply.findFirst({
      where: {
        id: replyId,
        discussionId,
      },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!reply) {
      return undefined;
    }

    return {
      author: reply.author.username,
      text: reply.text,
    };
  }

  async getDiscussionsByAuthor(username: string): Promise<Discussion[]>;
  async getDiscussionsByAuthor(
    username: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Discussion>>;
  async getDiscussionsByAuthor(
    username: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Discussion> | Discussion[]> {
    const discussions = await this.prisma.discussion.findMany({
      where: {
        author: {
          is: {
            username: {
              equals: username,
              mode: 'insensitive',
            },
          },
        },
      },
      orderBy: { id: 'asc' },
      skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
      take: pagination ? pagination.limit + 1 : undefined,
      include: {
        author: {
          select: {
            username: true,
          },
        },
        replies: {
          orderBy: { id: 'asc' },
          include: {
            author: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    const mappedDiscussions = discussions.map((discussion) =>
      this.mapDiscussion(discussion),
    );

    if (!pagination) {
      return mappedDiscussions;
    }

    return {
      items: mappedDiscussions.slice(0, pagination.limit),
      hasNextPage: mappedDiscussions.length > pagination.limit,
    };
  }

  async findByUser(
    username: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Discussion>> {
    const user = await this.prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
      select: {
        username: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.getDiscussionsByAuthor(user.username, pagination);
  }

  async addReply(
    discussionId: number,
    reply: CreateDiscussionReply,
  ): Promise<DiscussionReply | undefined> {
    const [discussion, author] = await Promise.all([
      this.prisma.discussion.findUnique({
        where: { id: discussionId },
        select: { id: true },
      }),
      this.prisma.user.findFirst({
        where: {
          username: {
            equals: reply.author.trim(),
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          username: true,
        },
      }),
    ]);

    if (!discussion || !author) {
      return undefined;
    }

    const nextReply = await this.prisma.discussionReply.create({
      data: {
        discussionId,
        authorId: author.id,
        text: reply.text.trim(),
      },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    return {
      author: nextReply.author.username,
      text: nextReply.text,
    };
  }

  private mapDiscussion(discussion: {
    id: number;
    title: string;
    excerpt: string;
    body: string;
    author: { username: string };
    replies: Array<{ text: string; author: { username: string } }>;
  }): Discussion {
    return {
      id: discussion.id,
      title: discussion.title,
      author: discussion.author.username,
      excerpt: discussion.excerpt,
      body: discussion.body,
      replies: discussion.replies.map((reply) => ({
        author: reply.author.username,
        text: reply.text,
      })),
    };
  }
}
