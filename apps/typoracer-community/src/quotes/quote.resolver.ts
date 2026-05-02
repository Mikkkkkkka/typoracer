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
import { QuotesService } from './quotes.service';

type ComplexityArgs = {
  args: { limit?: number };
  childComplexity: number;
};

@ObjectType({ description: 'Author information for a quote.' })
class QuoteAuthorType {
  @Field(() => String, { description: 'Public username of the author.' })
  username!: string;
}

@ObjectType({ description: 'Best record for a quote by a single player.' })
class QuoteRecordEntryType {
  @Field(() => String, { description: 'Public username of the player.' })
  username!: string;

  @Field(() => Int, { description: 'Rounded words per minute.' })
  wpm!: number;

  @Field(() => Int, { description: 'Rounded accuracy percentage.' })
  accuracy!: number;
}

@ObjectType({ description: 'Quote available for typing practice.' })
class QuoteType {
  @Field(() => Int, { description: 'Quote identifier.' })
  id!: number;

  @Field(() => String, {
    nullable: true,
    description: 'Optional preview image URL.',
  })
  image!: string | null;

  @Field(() => String, {
    description: 'Alternative text for the preview image.',
  })
  alt!: string;

  @Field(() => String, { description: 'Quote text shown to the user.' })
  text!: string;

  @Field(() => QuoteAuthorType, {
    nullable: true,
    description: 'Author of the quote.',
    complexity: 3,
  })
  author?: QuoteAuthorType;

  @Field(() => String, {
    nullable: true,
    description: 'Human-readable creation date.',
  })
  createdAt?: string;

  @Field(() => [QuoteRecordEntryType], {
    nullable: 'itemsAndList',
    description: 'Best record per player for this quote.',
    complexity: 5,
  })
  records?: QuoteRecordEntryType[];
}

@ObjectType({ description: 'Paginated quote collection.' })
class QuotePageType {
  @Field(() => [QuoteType], { description: 'Current page of quotes.' })
  items!: QuoteType[];

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

@ObjectType({ description: 'Mutation result for quote submission workflow.' })
class QuoteSubmissionType {
  @Field(() => Int, { description: 'Quote identifier.' })
  id!: number;

  @Field(() => String, { description: 'Submitted quote text.' })
  text!: string;

  @Field(() => String, {
    nullable: true,
    description: 'Optional source of the quote.',
  })
  source!: string | null;

  @Field(() => String, { description: 'Current moderation status.' })
  status!: string;
}

@InputType({ description: 'Input for submitting a quote for moderation.' })
class SubmitQuoteInput {
  @Field(() => String, { description: 'Quote text to submit.' })
  text!: string;

  @Field(() => String, {
    nullable: true,
    description: 'Optional source attribution.',
  })
  source?: string;
}

@InputType({ description: 'Input for updating a submitted quote.' })
class UpdateQuoteInput {
  @Field(() => String, { nullable: true, description: 'Updated quote text.' })
  text?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Updated source attribution.',
  })
  source?: string;
}

@Resolver(() => QuoteType)
export class QuoteResolver {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => QuotePageType, {
    name: 'quotes',
    description: 'Browse approved quotes with pagination.',
    complexity: ({ args, childComplexity }: ComplexityArgs) =>
      Math.max(args.limit ?? 20, 1) * childComplexity,
  })
  async getQuotes(@Args() pagination: PaginationArgs): Promise<QuotePageType> {
    const result = await this.quotesService.findAll(pagination);

    return {
      items: result.items,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: pagination.page > 1,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Query(() => QuoteType, {
    name: 'quote',
    description: 'Get one approved quote by id.',
    complexity: 5,
  })
  async getQuote(@Args('id', { type: () => Int }) id: number) {
    const quote = await this.quotesService.findOne(id);

    if (!quote) {
      throw new NotFoundException('Quote not found.');
    }

    return quote;
  }

  @Mutation(() => QuoteSubmissionType, {
    description: 'Submit a new quote for moderation as the authenticated user.',
    complexity: 5,
  })
  async submitQuote(
    @Args('input') input: SubmitQuoteInput,
    @Context('req') request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const quote = await this.quotesService.submitQuote({
      authorUsername: currentUser.username,
      text: input.text,
      source: input.source,
    });

    if (!quote) {
      throw new NotFoundException('Author not found.');
    }

    return quote;
  }

  @Mutation(() => QuoteSubmissionType, {
    description: 'Update your own submitted quote.',
    complexity: 5,
  })
  async updateQuote(
    @Args('quoteId', { type: () => Int }) quoteId: number,
    @Args('input') input: UpdateQuoteInput,
    @Context('req') request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const quote = await this.quotesService.updateQuote(
      quoteId,
      currentUser.username,
      input,
    );

    if (!quote) {
      throw new NotFoundException('Quote not found.');
    }

    return quote;
  }

  @Mutation(() => Boolean, {
    description: 'Delete your own quote.',
    complexity: 3,
  })
  async deleteQuote(
    @Args('quoteId', { type: () => Int }) quoteId: number,
    @Context('req') request: Request,
  ) {
    const currentUser = await this.authService.requireCurrentUser(request);
    const deleted = await this.quotesService.deleteQuote(
      quoteId,
      currentUser.username,
    );

    if (!deleted) {
      throw new NotFoundException('Quote not found.');
    }

    return true;
  }

  @ResolveField(() => QuoteAuthorType, {
    description: 'Author of the quote.',
    complexity: 3,
  })
  async author(parent: QuoteType) {
    const quote = await this.quotesService.findOne(parent.id);

    if (!quote) {
      throw new NotFoundException('Quote not found.');
    }

    return quote.author;
  }

  @ResolveField(() => String, {
    description: 'Human-readable creation date.',
    complexity: 2,
  })
  async createdAt(parent: QuoteType) {
    const quote = await this.quotesService.findOne(parent.id);

    if (!quote) {
      throw new NotFoundException('Quote not found.');
    }

    return quote.createdAt;
  }

  @ResolveField(() => [QuoteRecordEntryType], {
    description: 'Best quote records grouped by player.',
    complexity: 5,
  })
  async records(parent: QuoteType) {
    const quote = await this.quotesService.findOne(parent.id);

    if (!quote) {
      throw new NotFoundException('Quote not found.');
    }

    return quote.records;
  }
}
