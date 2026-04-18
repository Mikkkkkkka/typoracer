import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDiscussionReply,
  Discussion,
  DiscussionReply,
} from './discussions.models';

@Injectable()
export class DiscussionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDiscussions(): Promise<Discussion[]> {
    const discussions = await this.prisma.discussion.findMany({
      orderBy: { id: 'asc' },
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

    return discussions.map((discussion) => this.mapDiscussion(discussion));
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

  async getReplies(discussionId: number): Promise<DiscussionReply[]> {
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
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    return replies.map((reply) => ({
      author: reply.author.username,
      text: reply.text,
    }));
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

  async getDiscussionsByAuthor(username: string): Promise<Discussion[]> {
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

    return discussions.map((discussion) => this.mapDiscussion(discussion));
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
