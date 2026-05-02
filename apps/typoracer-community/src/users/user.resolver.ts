import { Args, Field, Int, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { AttemptsService } from '../attempts/attempts.service';
import { DiscussionsService } from '../discussions/discussions.service';
import { PaginationArgs } from '../graphql/pagination.args';
import { UsersService } from './users.service';

type ComplexityArgs = {
  args: { limit?: number };
  childComplexity: number;
};

@ObjectType({ description: 'Aggregate typing statistics for a user profile.' })
class UserStatsType {
  @Field(() => Int, { description: 'Best recorded WPM.' })
  wpm!: number;

  @Field(() => Int, { description: 'Average accuracy percentage.' })
  accuracy!: number;

  @Field(() => Int, { description: 'Number of discussions started.' })
  discussions!: number;
}

@ObjectType({ description: 'Public user profile.' })
class UserType {
  @Field(() => String, { description: 'Public username.' })
  username!: string;

  @Field(() => String, { description: 'Month and year when the user joined.' })
  joinedAt!: string;

  @Field(() => String, {
    nullable: true,
    description: 'Optional user biography.',
  })
  bio!: string | null;

  @Field(() => UserStatsType, {
    nullable: true,
    description: 'Aggregate typing and participation statistics.',
    complexity: 4,
  })
  stats?: UserStatsType;
}

@ObjectType({
  description: 'Leaderboard row based on approved quote attempts.',
})
class LeaderboardEntryType {
  @Field(() => String, { description: 'Public username.' })
  username!: string;

  @Field(() => Int, {
    description: 'Average WPM rounded to the nearest integer.',
  })
  wpm!: number;

  @Field(() => Int, {
    description: 'Average accuracy rounded to the nearest integer.',
  })
  accuracy!: number;
}

@ObjectType({ description: 'Paginated user collection.' })
class UserPageType {
  @Field(() => [UserType], { description: 'Current page of users.' })
  items!: UserType[];

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

@ObjectType({ description: 'Paginated leaderboard.' })
class LeaderboardPageType {
  @Field(() => [LeaderboardEntryType], {
    description: 'Current page of leaderboard entries.',
  })
  items!: LeaderboardEntryType[];

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

@Resolver(() => UserType)
export class UserResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly discussionsService: DiscussionsService,
    private readonly attemptsService: AttemptsService,
  ) {}

  @Query(() => UserPageType, {
    name: 'users',
    description: 'Browse users with pagination.',
    complexity: ({ args, childComplexity }: ComplexityArgs) =>
      Math.max(args.limit ?? 20, 1) * childComplexity,
  })
  async getUsers(@Args() pagination: PaginationArgs): Promise<UserPageType> {
    const result = await this.usersService.findAll(pagination);

    return {
      items: result.items,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: pagination.page > 1,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Query(() => UserType, {
    name: 'user',
    description: 'Get one user profile by username.',
    complexity: 5,
  })
  async getUser(@Args('username') username: string) {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  @Query(() => LeaderboardPageType, {
    name: 'leaderboard',
    description: 'Get the typing leaderboard based on approved quote attempts.',
    complexity: ({ args, childComplexity }: ComplexityArgs) =>
      Math.max(args.limit ?? 20, 1) * childComplexity,
  })
  async getLeaderboard(
    @Args() pagination: PaginationArgs,
  ): Promise<LeaderboardPageType> {
    const result = await this.usersService.findLeaderboard(pagination);

    return {
      items: result.items,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: pagination.page > 1,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Query(() => Int, {
    name: 'userDiscussionCount',
    description: 'Count discussions created by a user.',
    complexity: 3,
  })
  async getUserDiscussionCount(@Args('username') username: string) {
    const discussions =
      await this.discussionsService.getDiscussionsByAuthor(username);

    return discussions.length;
  }

  @Query(() => Int, {
    name: 'userAttemptCount',
    description: 'Count attempts created by a user.',
    complexity: 3,
  })
  async getUserAttemptCount(@Args('username') username: string) {
    const attempts = await this.attemptsService.findDetailedByUser(username);
    return attempts.length;
  }
}
