import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { DiscussionsService } from '../../discussions/discussions.service';
import { UsersService } from '../../users/users.service';
import { CreateDiscussionReplyInput } from '../inputs/discussion.inputs';
import { buildPage, normalizePagination } from '../graphql.helpers';
import { DiscussionReplyType, DiscussionType } from '../types/discussion.type';
import { PaginationInput } from '../types/pagination.input';
import { DiscussionPageType, DiscussionReplyPageType } from '../types/wrappers.type';
import { UserType } from '../types/user.type';

@Resolver(() => DiscussionType)
export class DiscussionsResolver {
  constructor(
    private readonly discussionsService: DiscussionsService,
    private readonly usersService: UsersService,
  ) {}

  @Query(() => DiscussionPageType, {
    name: 'discussions',
    description: 'Get a paginated list of discussions.',
  })
  async getDiscussions(
    @Args('pagination', {
      type: () => PaginationInput,
      nullable: true,
      description: 'Optional pagination arguments.',
    })
    pagination?: PaginationInput,
  ): Promise<DiscussionPageType> {
    const normalized = normalizePagination(pagination);
    const result = await this.discussionsService.getDiscussions(normalized);

    return buildPage<DiscussionPageType, DiscussionType>(normalized, {
      ...result,
      items: result.items.map((discussion) => ({
        id: discussion.id,
        title: discussion.title,
        excerpt: discussion.excerpt,
        body: discussion.body,
        authorUsername: discussion.author,
      })),
    });
  }

  @Query(() => DiscussionType, {
    name: 'discussion',
    nullable: true,
    description: 'Get a discussion by identifier.',
  })
  async getDiscussion(
    @Args('id', {
      type: () => Int,
      description: 'The discussion identifier.',
    })
    id: number,
  ): Promise<DiscussionType | null> {
    const discussion = await this.discussionsService.getDiscussionById(id);

    if (!discussion) {
      return null;
    }

    return {
      id: discussion.id,
      title: discussion.title,
      excerpt: discussion.excerpt,
      body: discussion.body,
      authorUsername: discussion.author,
    };
  }

  @Mutation(() => DiscussionReplyType, {
    name: 'createDiscussionReply',
    nullable: true,
    description: 'Create a reply in a discussion.',
  })
  async createDiscussionReply(
    @Args('discussionId', {
      type: () => Int,
      description: 'The discussion identifier.',
    })
    discussionId: number,
    @Args('input', {
      type: () => CreateDiscussionReplyInput,
      description: 'The reply creation payload.',
    })
    input: CreateDiscussionReplyInput,
  ): Promise<DiscussionReplyType | null> {
    const reply = await this.discussionsService.addReply(discussionId, input);

    if (!reply) {
      return null;
    }

    return {
      text: reply.text,
      authorUsername: reply.author,
    };
  }

  @ResolveField(() => UserType, {
    description: 'Resolve the discussion author.',
  })
  async author(@Parent() discussion: DiscussionType): Promise<UserType | null> {
    const user = await this.usersService.getUserByUsername(
      discussion.authorUsername ?? '',
    );

    return user ?? null;
  }

  @ResolveField(() => DiscussionReplyPageType, {
    description: 'Resolve replies posted in the discussion.',
  })
  async replies(
    @Parent() discussion: DiscussionType,
    @Args('pagination', {
      type: () => PaginationInput,
      nullable: true,
      description: 'Optional pagination arguments.',
    })
    pagination?: PaginationInput,
  ): Promise<DiscussionReplyPageType> {
    const normalized = normalizePagination(pagination);
    const result = await this.discussionsService.getReplies(
      discussion.id,
      normalized,
    );

    return buildPage<DiscussionReplyPageType, DiscussionReplyType>(normalized, {
      ...result,
      items: result.items.map((reply) => ({
        text: reply.text,
        authorUsername: reply.author,
      })),
    });
  }
}

@Resolver(() => DiscussionReplyType)
export class DiscussionRepliesResolver {
  constructor(private readonly usersService: UsersService) {}

  @ResolveField(() => UserType, {
    description: 'Resolve the reply author.',
  })
  async author(@Parent() reply: DiscussionReplyType): Promise<UserType | null> {
    const user = await this.usersService.getUserByUsername(
      reply.authorUsername ?? '',
    );

    return user ?? null;
  }
}
