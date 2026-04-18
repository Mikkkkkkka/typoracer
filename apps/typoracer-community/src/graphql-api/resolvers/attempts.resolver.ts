import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AttemptsService } from '../../attempts/attempts.service';
import { QuotesService } from '../../quotes/quotes.service';
import { UsersService } from '../../users/users.service';
import {
  CreateAttemptInput,
  UpdateAttemptInput,
} from '../inputs/attempt.inputs';
import { buildPage, normalizePagination } from '../graphql.helpers';
import { PaginationInput } from '../types/pagination.input';
import { AttemptType, QuoteType } from '../types/quote.type';
import { AttemptPageType } from '../types/wrappers.type';
import { UserType } from '../types/user.type';

@Resolver(() => AttemptType)
export class AttemptsResolver {
  constructor(
    private readonly attemptsService: AttemptsService,
    private readonly usersService: UsersService,
    private readonly quotesService: QuotesService,
  ) {}

  @Query(() => AttemptPageType, {
    name: 'attempts',
    description: 'Get a paginated list of typing attempts.',
  })
  async getAttempts(
    @Args('pagination', {
      type: () => PaginationInput,
      nullable: true,
      description: 'Optional pagination arguments.',
    })
    pagination?: PaginationInput,
  ): Promise<AttemptPageType> {
    const normalized = normalizePagination(pagination);
    const result = await this.attemptsService.findAll(normalized);

    return buildPage<AttemptPageType, AttemptType>(normalized, result);
  }

  @Query(() => AttemptType, {
    name: 'attempt',
    nullable: true,
    description: 'Get a typing attempt by identifier.',
  })
  async getAttempt(
    @Args('id', {
      type: () => Int,
      description: 'The attempt identifier.',
    })
    id: number,
  ): Promise<AttemptType | null> {
    try {
      return await this.attemptsService.findOne(id);
    } catch {
      return null;
    }
  }

  @Mutation(() => AttemptType, {
    name: 'createAttempt',
    description: 'Create a new typing attempt.',
  })
  async createAttempt(
    @Args('input', {
      type: () => CreateAttemptInput,
      description: 'The attempt creation payload.',
    })
    input: CreateAttemptInput,
  ): Promise<AttemptType> {
    return this.attemptsService.create({
      quoteId: input.quoteId,
      userId: input.userId,
      accuracy: input.accuracy,
      wpm: input.wpm,
      maxRawWpm: input.maxRawWpm ?? input.wpm,
    });
  }

  @Mutation(() => AttemptType, {
    name: 'updateAttempt',
    description: 'Update an existing typing attempt.',
  })
  async updateAttempt(
    @Args('id', {
      type: () => Int,
      description: 'The attempt identifier.',
    })
    id: number,
    @Args('input', {
      type: () => UpdateAttemptInput,
      description: 'The attempt update payload.',
    })
    input: UpdateAttemptInput,
  ): Promise<AttemptType> {
    return this.attemptsService.update(id, input);
  }

  @Mutation(() => AttemptType, {
    name: 'deleteAttempt',
    description: 'Delete a typing attempt.',
  })
  async deleteAttempt(
    @Args('id', {
      type: () => Int,
      description: 'The attempt identifier.',
    })
    id: number,
  ): Promise<AttemptType> {
    return this.attemptsService.remove(id);
  }

  @ResolveField(() => UserType, {
    description: 'Resolve the attempt author.',
  })
  async user(@Parent() attempt: AttemptType): Promise<UserType | null> {
    const user = await this.usersService.getUserById(attempt.userId);
    return user ?? null;
  }

  @ResolveField(() => QuoteType, {
    description: 'Resolve the related quote.',
  })
  async quote(@Parent() attempt: AttemptType): Promise<QuoteType | null> {
    const quote = await this.quotesService.getQuoteReferenceById(
      attempt.quoteId,
    );

    if (!quote) {
      return null;
    }

    return {
      id: quote.id,
      image: quote.image,
      alt: quote.alt,
      text: quote.text,
      createdAt: quote.createdAt,
      authorUsername: quote.author.username,
    };
  }
}
