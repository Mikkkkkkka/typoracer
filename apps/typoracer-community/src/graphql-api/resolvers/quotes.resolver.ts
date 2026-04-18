import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AttemptsService } from '../../attempts/attempts.service';
import { QuotesService } from '../../quotes/quotes.service';
import { UsersService } from '../../users/users.service';
import { CreateAttemptInput } from '../inputs/attempt.inputs';
import { buildPage, normalizePagination } from '../graphql.helpers';
import { PaginationInput } from '../types/pagination.input';
import {
  AttemptType,
  QuoteRecordEntryType,
  QuoteRecordsPayloadType,
  QuoteType,
} from '../types/quote.type';
import { AttemptPageType, QuotePageType } from '../types/wrappers.type';
import { UserType } from '../types/user.type';

@Resolver(() => QuoteType)
export class QuotesResolver {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly attemptsService: AttemptsService,
    private readonly usersService: UsersService,
  ) {}

  @Query(() => QuotePageType, {
    name: 'quotes',
    description: 'Get a paginated list of approved quotes.',
  })
  async getQuotes(
    @Args('pagination', {
      type: () => PaginationInput,
      nullable: true,
      description: 'Optional pagination arguments.',
    })
    pagination?: PaginationInput,
  ): Promise<QuotePageType> {
    const normalized = normalizePagination(pagination);
    const result = await this.quotesService.getQuotes(normalized);

    return buildPage<QuotePageType, QuoteType>(normalized, {
      ...result,
      items: result.items.map((quote) => ({
        ...quote,
        createdAt: '',
      })),
    });
  }

  @Query(() => QuoteType, {
    name: 'quote',
    nullable: true,
    description: 'Get an approved quote by identifier.',
  })
  async getQuote(
    @Args('id', {
      type: () => Int,
      description: 'The quote identifier.',
    })
    id: number,
  ): Promise<QuoteType | null> {
    const quote = await this.quotesService.getQuoteById(id);

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

  @Query(() => QuoteRecordsPayloadType, {
    name: 'quoteRecords',
    nullable: true,
    description: 'Get current records for a quote.',
  })
  async getQuoteRecords(
    @Args('quoteId', {
      type: () => Int,
      description: 'The quote identifier.',
    })
    quoteId: number,
  ): Promise<QuoteRecordsPayloadType | null> {
    const payload = await this.quotesService.getQuoteRecordsPayload(quoteId);

    return payload ?? null;
  }

  @Mutation(() => QuoteRecordsPayloadType, {
    name: 'submitQuoteAttempt',
    description: 'Create a new attempt for an approved quote and return updated records.',
  })
  async submitQuoteAttempt(
    @Args('input', {
      type: () => CreateAttemptInput,
      description: 'The attempt creation payload.',
    })
    input: CreateAttemptInput,
  ): Promise<QuoteRecordsPayloadType> {
    return this.quotesService.createAttempt({
      quoteId: input.quoteId,
      userId: input.userId,
      accuracy: input.accuracy,
      wpm: input.wpm,
      maxRawWpm: input.maxRawWpm ?? input.wpm,
    });
  }

  @ResolveField(() => UserType, {
    description: 'Resolve the quote author.',
  })
  async author(@Parent() quote: QuoteType): Promise<UserType | null> {
    const username = quote.authorUsername;

    if (!username) {
      const fullQuote = await this.quotesService.getQuoteReferenceById(quote.id);
      return fullQuote
        ? ((await this.usersService.getUserByUsername(fullQuote.author.username)) ??
            null)
        : null;
    }

    return (await this.usersService.getUserByUsername(username)) ?? null;
  }

  @ResolveField(() => String, {
    description: 'Resolve the formatted quote creation date.',
  })
  async createdAt(@Parent() quote: QuoteType): Promise<string> {
    if (quote.createdAt) {
      return quote.createdAt;
    }

    const fullQuote = await this.quotesService.getQuoteReferenceById(quote.id);
    return fullQuote?.createdAt ?? '';
  }

  @ResolveField(() => [QuoteRecordEntryType], {
    description: 'Resolve the current records for the quote.',
  })
  async records(@Parent() quote: QuoteType) {
    return this.quotesService.getQuoteRecords(quote.id);
  }

  @ResolveField(() => AttemptPageType, {
    description: 'Resolve attempts made for the quote.',
  })
  async attempts(
    @Parent() quote: QuoteType,
    @Args('pagination', {
      type: () => PaginationInput,
      nullable: true,
      description: 'Optional pagination arguments.',
    })
    pagination?: PaginationInput,
  ): Promise<AttemptPageType> {
    const normalized = normalizePagination(pagination);
    const result = await this.attemptsService.findByQuote(quote.id, normalized);

    return buildPage<AttemptPageType, AttemptType>(normalized, result);
  }
}
