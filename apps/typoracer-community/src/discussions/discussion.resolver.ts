import { NotFoundException } from '@nestjs/common';
import { Int } from '@nestjs/graphql';
import {
  Args,
  Context,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { PaginationArgs } from '../graphql/pagination.args';
import { DiscussionsService } from './discussions.service';

type ComplexityArgs = {
  args: { limit?: number };
  childComplexity: number;
};

@ObjectType({ description: 'Reply inside a discussion thread.' })
class DiscussionReplyType {
  @Field(() => Int, { description: 'Reply identifier.' })
  id!: number;

  @Field(() => String, { description: 'Username of the reply author.' })
  author!: string;

  @Field(() => String, { description: 'Reply text.' })
  text!: string;
}

@ObjectType({ description: 'Forum discussion thread.' })
class DiscussionType {
  @Field(() => Int, { description: 'Discussion identifier.' })
  id!: number;

  @Field(() => String, { description: 'Discussion title.' })
  title!: string;

  @Field(() => String, { description: 'Author username.' })
  author!: string;

  @Field(() => String, { description: 'Short summary shown in lists.' })
  excerpt!: string;

  @Field(() => String, { description: 'Full discussion body.' })
  body!: string;

  @Field(() => [DiscussionReplyType], {
    nullable: 'itemsAndList',
    description: 'Replies posted in the discussion.',
    complexity: 5,
  })
  replies?: DiscussionReplyType[];
}

@ObjectType({ description: 'Paginated discussion collection.' })
class DiscussionPageType {
  @Field(() => [DiscussionType], {
    description: 'Current page of discussions.',
  })
  items!: DiscussionType[];

  @Field(() => Boolean, {
    description: 'Whether there is another page after the current one.',
  })
  hasNextPage!: boolean;

  @Field(() => Boolean, {
    description: 'Whether there is a page before the current one.',
  })
  hasPreviousPage!: boolean;

  @Field(() => Int, { description: 'Current page number.' })
  page!: number;

  @Field(() => Int, { description: 'Page size.' })
  limit!: number;
}

@InputType({ description: 'Input for creating a discussion.' })
class CreateDiscussionInput {
  @Field(() => String, { description: 'Discussion title.' })
  title!: string;

  @Field(() => String, { description: 'Short list summary.' })
  excerpt!: string;

  @Field(() => String, { description: 'Full discussion body.' })
  body!: string;
}

@InputType({ description: 'Input for updating a discussion.' })
class UpdateDiscussionInput {
  @Field(() => String, { nullable: true, description: 'Updated title.' })
  title?: string;

  @Field(() => String, { nullable: true, description: 'Updated excerpt.' })
  excerpt?: string;

  @Field(() => String, { nullable: true, description: 'Updated body.' })
  body?: string;
}

@InputType({ description: 'Input for posting a discussion reply.' })
class CreateDiscussionReplyInput {
  @Field(() => String, { description: 'Reply text.' })
  text!: string;
}

@InputType({ description: 'Input for editing a discussion reply.' })
class UpdateDiscussionReplyInput {
  @Field(() => String, { description: 'Updated reply text.' })
  text!: string;
}

@Resolver(() => DiscussionType)
export class DiscussionResolver {
  constructor(
    private readonly discussionsService: DiscussionsService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => DiscussionPageType, {
    name: 'discussions',
    description: 'Browse discussions with pagination.',
    complexity: ({ args, childComplexity }: ComplexityArgs) =>
      Math.max(args.limit ?? 20, 1) * childComplexity,
  })
  async getDiscussions(@Args() pagination: PaginationArgs) {
    const result = await this.discussionsService.getDiscussions(pagination);

    return {
      items: result.items,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: pagination.page > 1,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Query(() => DiscussionType, {
    name: 'discussion',
    description: 'Get one discussion by id.',
    complexity: 5,
  })
  async getDiscussion(@Args('id', { type: () => Int }) id: number) {
    const discussion = await this.discussionsService.getDiscussionById(id);

    if (!discussion) {
      throw new NotFoundException('Discussion not found.');
    }

    return discussion;
  }

  @Mutation(() => DiscussionType, {
    description: 'Create a discussion as the authenticated user.',
    complexity: 5,
  })
  async createDiscussion(
    @Args('input') input: CreateDiscussionInput,
    @Context('req') request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const discussion = await this.discussionsService.createDiscussion({
      author: currentUser.username,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
    });

    if (!discussion) {
      throw new NotFoundException('Author not found.');
    }

    return discussion;
  }

  @Mutation(() => DiscussionType, {
    description: 'Update your own discussion.',
    complexity: 5,
  })
  async updateDiscussion(
    @Args('discussionId', { type: () => Int }) discussionId: number,
    @Args('input') input: UpdateDiscussionInput,
    @Context('req') request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const discussion = await this.discussionsService.updateDiscussion(
      discussionId,
      currentUser.username,
      input,
    );

    if (!discussion) {
      throw new NotFoundException('Discussion not found.');
    }

    return discussion;
  }

  @Mutation(() => Boolean, {
    description: 'Delete your own discussion.',
    complexity: 3,
  })
  async deleteDiscussion(
    @Args('discussionId', { type: () => Int }) discussionId: number,
    @Context('req') request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const deleted = await this.discussionsService.deleteDiscussion(
      discussionId,
      currentUser.username,
    );

    if (!deleted) {
      throw new NotFoundException('Discussion not found.');
    }

    return true;
  }

  @Mutation(() => DiscussionReplyType, {
    description: 'Post a reply to a discussion.',
    complexity: 4,
  })
  async addDiscussionReply(
    @Args('discussionId', { type: () => Int }) discussionId: number,
    @Args('input') input: CreateDiscussionReplyInput,
    @Context('req') request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const reply = await this.discussionsService.addReply(discussionId, {
      author: currentUser.username,
      text: input.text,
    });

    if (!reply) {
      throw new NotFoundException('Discussion or author not found.');
    }

    return reply;
  }

  @Mutation(() => DiscussionReplyType, {
    description: 'Update your own reply.',
    complexity: 4,
  })
  async updateDiscussionReply(
    @Args('discussionId', { type: () => Int }) discussionId: number,
    @Args('replyId', { type: () => Int }) replyId: number,
    @Args('input') input: UpdateDiscussionReplyInput,
    @Context('req') request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const reply = await this.discussionsService.updateReply(
      discussionId,
      replyId,
      currentUser.username,
      input.text,
    );

    if (!reply) {
      throw new NotFoundException('Reply not found.');
    }

    return reply;
  }

  @Mutation(() => Boolean, {
    description: 'Delete your own discussion reply.',
    complexity: 3,
  })
  async deleteDiscussionReply(
    @Args('discussionId', { type: () => Int }) discussionId: number,
    @Args('replyId', { type: () => Int }) replyId: number,
    @Context('req') request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const deleted = await this.discussionsService.deleteReply(
      discussionId,
      replyId,
      currentUser.username,
    );

    if (!deleted) {
      throw new NotFoundException('Reply not found.');
    }

    return true;
  }

  @ResolveField(() => [DiscussionReplyType], {
    description: 'Replies for this discussion.',
    complexity: 5,
  })
  async replies(parent: DiscussionType) {
    return this.discussionsService.getReplies(parent.id);
  }
}
