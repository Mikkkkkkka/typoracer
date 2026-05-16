import { NotFoundException } from '@nestjs/common';
import { Float, Int } from '@nestjs/graphql';
import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { IsInt, IsNumber, IsOptional } from 'class-validator';
import { PaginationArgs } from '../graphql/pagination.args';
import { AttemptsService } from './attempts.service';

type ComplexityArgs = {
  args: { limit?: number };
  childComplexity: number;
};

@ObjectType({ description: 'Typing attempt for a quote.' })
class AttemptType {
  @Field(() => Int, { description: 'Attempt identifier.' })
  id!: number;

  @Field(() => Int, { description: 'Related quote identifier.' })
  quoteId!: number;

  @Field(() => Int, { description: 'User identifier.' })
  userId!: number;

  @Field(() => Float, { description: 'Accuracy percentage.' })
  accuracy!: number;

  @Field(() => Float, { description: 'Words per minute.' })
  wpm!: number;

  @Field(() => Float, {
    description: 'Maximum raw WPM recorded during the run.',
  })
  maxRawWpm!: number;

  @Field(() => String, {
    description: 'ISO timestamp when the attempt was created.',
  })
  createdAt!: string;
}

@ObjectType({ description: 'Paginated attempt collection.' })
class AttemptPageType {
  @Field(() => [AttemptType], { description: 'Current page of attempts.' })
  items!: AttemptType[];

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

@InputType({ description: 'Input for creating a typing attempt.' })
class CreateAttemptInput {
  @IsInt()
  @Field(() => Int, { description: 'Related quote identifier.' })
  quoteId!: number;

  @IsInt()
  @Field(() => Int, { description: 'User identifier.' })
  userId!: number;

  @IsNumber()
  @Field(() => Float, { description: 'Accuracy percentage.' })
  accuracy!: number;

  @IsNumber()
  @Field(() => Float, { description: 'Words per minute.' })
  wpm!: number;

  @IsOptional()
  @IsNumber()
  @Field(() => Float, {
    nullable: true,
    description: 'Optional max raw WPM value.',
  })
  maxRawWpm?: number;
}

@InputType({ description: 'Input for updating an attempt.' })
class UpdateAttemptInput {
  @IsOptional()
  @IsInt()
  @Field(() => Int, {
    nullable: true,
    description: 'Updated quote identifier.',
  })
  quoteId?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true, description: 'Updated user identifier.' })
  userId?: number;

  @IsOptional()
  @IsNumber()
  @Field(() => Float, {
    nullable: true,
    description: 'Updated accuracy percentage.',
  })
  accuracy?: number;

  @IsOptional()
  @IsNumber()
  @Field(() => Float, {
    nullable: true,
    description: 'Updated words per minute.',
  })
  wpm?: number;

  @IsOptional()
  @IsNumber()
  @Field(() => Float, {
    nullable: true,
    description: 'Updated max raw WPM.',
  })
  maxRawWpm?: number;
}

@Resolver(() => AttemptType)
export class AttemptResolver {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Query(() => AttemptPageType, {
    name: 'attempts',
    description: 'Browse attempts with pagination.',
    complexity: ({ args, childComplexity }: ComplexityArgs) =>
      Math.max(args.limit ?? 20, 1) * childComplexity,
  })
  async getAttempts(
    @Args() pagination: PaginationArgs,
  ): Promise<AttemptPageType> {
    const result = await this.attemptsService.findAll(pagination);

    return {
      items: result.items,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: pagination.page > 1,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Query(() => AttemptType, {
    name: 'attempt',
    description: 'Get one attempt by id.',
    complexity: 4,
  })
  async getAttempt(@Args('id', { type: () => Int }) id: number) {
    return this.attemptsService.findOne(id);
  }

  @Query(() => AttemptPageType, {
    name: 'quoteAttempts',
    description: 'Browse attempts for a single quote.',
    complexity: ({ args, childComplexity }: ComplexityArgs) =>
      Math.max(args.limit ?? 20, 1) * childComplexity,
  })
  async getQuoteAttempts(
    @Args('quoteId', { type: () => Int }) quoteId: number,
    @Args() pagination: PaginationArgs,
  ): Promise<AttemptPageType> {
    const result = await this.attemptsService.findByQuote(quoteId, pagination);

    return {
      items: result.items,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: pagination.page > 1,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Query(() => AttemptPageType, {
    name: 'userAttempts',
    description: 'Browse attempts created by a single user.',
    complexity: ({ args, childComplexity }: ComplexityArgs) =>
      Math.max(args.limit ?? 20, 1) * childComplexity,
  })
  async getUserAttempts(
    @Args('username') username: string,
    @Args() pagination: PaginationArgs,
  ): Promise<AttemptPageType> {
    const result = await this.attemptsService.findByUser(username, pagination);

    return {
      items: result.items,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: pagination.page > 1,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  @Mutation(() => AttemptType, {
    description: 'Create a typing attempt.',
    complexity: 5,
  })
  async createAttempt(@Args('input') input: CreateAttemptInput) {
    return this.attemptsService.create({
      ...input,
      maxRawWpm: input.maxRawWpm ?? input.wpm,
    });
  }

  @Mutation(() => AttemptType, {
    description: 'Update an existing typing attempt.',
    complexity: 5,
  })
  async updateAttempt(
    @Args('attemptId', { type: () => Int }) attemptId: number,
    @Args('input') input: UpdateAttemptInput,
  ) {
    return this.attemptsService.update(attemptId, input);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a typing attempt.',
    complexity: 3,
  })
  async deleteAttempt(
    @Args('attemptId', { type: () => Int }) attemptId: number,
  ) {
    const deleted = await this.attemptsService.remove(attemptId);

    if (!deleted) {
      throw new NotFoundException('Attempt not found.');
    }

    return true;
  }
}
