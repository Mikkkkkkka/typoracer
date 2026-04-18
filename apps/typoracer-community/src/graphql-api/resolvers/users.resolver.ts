import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AttemptsService } from '../../attempts/attempts.service';
import { DiscussionsService } from '../../discussions/discussions.service';
import { UsersService } from '../../users/users.service';
import { normalizePagination, buildPage } from '../graphql.helpers';
import { PaginationInput } from '../types/pagination.input';
import { AttemptType } from '../types/quote.type';
import { DiscussionType } from '../types/discussion.type';
import { AttemptPageType, DiscussionPageType, UserPageType } from '../types/wrappers.type';
import { UserStatsType, UserType } from '../types/user.type';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly discussionsService: DiscussionsService,
    private readonly attemptsService: AttemptsService,
  ) {}

  @Query(() => UserPageType, {
    name: 'users',
    description: 'Get a paginated list of community users.',
  })
  async getUsers(
    @Args('pagination', {
      type: () => PaginationInput,
      nullable: true,
      description: 'Optional pagination arguments.',
    })
    pagination?: PaginationInput,
  ): Promise<UserPageType> {
    const normalized = normalizePagination(pagination);
    const result = await this.usersService.getUsers(normalized);

    return buildPage<UserPageType, UserType>(normalized, {
      ...result,
      items: result.items.map((user) => ({
        ...user,
        stats: { wpm: 0, accuracy: 0, discussions: 0 },
      })),
    });
  }

  @Query(() => UserType, {
    name: 'user',
    nullable: true,
    description: 'Get a user profile by username.',
  })
  async getUser(
    @Args('username', {
      type: () => String,
      description: 'The public username to look up.',
    })
    username: string,
  ): Promise<UserType | null> {
    const user = await this.usersService.getUserByUsername(username);

    return user ?? null;
  }

  @ResolveField(() => UserStatsType, {
    description: 'Resolve computed statistics for a user.',
  })
  async stats(@Parent() user: UserType): Promise<UserStatsType> {
    if (user.stats && (user.stats.wpm || user.stats.accuracy || user.stats.discussions)) {
      return user.stats;
    }

    const fullUser =
      user.userId !== undefined
        ? await this.usersService.getUserById(user.userId)
        : await this.usersService.getUserByUsername(user.username);

    return fullUser?.stats ?? { wpm: 0, accuracy: 0, discussions: 0 };
  }

  @ResolveField(() => DiscussionPageType, {
    description: 'Resolve discussions created by the user.',
  })
  async discussions(
    @Parent() user: UserType,
    @Args('pagination', {
      type: () => PaginationInput,
      nullable: true,
      description: 'Optional pagination arguments.',
    })
    pagination?: PaginationInput,
  ): Promise<DiscussionPageType> {
    const normalized = normalizePagination(pagination);
    const result = await this.discussionsService.getDiscussionsByAuthor(
      user.username,
      normalized,
    );

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

  @ResolveField(() => AttemptPageType, {
    description: 'Resolve attempts created by the user.',
  })
  async attempts(
    @Parent() user: UserType,
    @Args('pagination', {
      type: () => PaginationInput,
      nullable: true,
      description: 'Optional pagination arguments.',
    })
    pagination?: PaginationInput,
  ): Promise<AttemptPageType> {
    const normalized = normalizePagination(pagination);
    const result = await this.attemptsService.findByUser(user.username, normalized);

    return buildPage<AttemptPageType, AttemptType>(normalized, result);
  }
}
