import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@InputType({ description: 'Pagination arguments for list queries.' })
export class PaginationInput {
  @Field(() => Int, {
    description: 'The 1-based page number to fetch.',
    defaultValue: 1,
  })
  @Min(1)
  page: number = 1;

  @Field(() => Int, {
    description: 'The maximum number of items to return on a page.',
    defaultValue: 20,
  })
  @Min(1)
  @Max(50)
  limit: number = 20;
}

@ObjectType({ description: 'Pagination metadata for list responses.' })
export class PageInfoType {
  @Field(() => Int, {
    description: 'The current 1-based page number.',
  })
  page!: number;

  @Field(() => Int, {
    description: 'The requested page size.',
  })
  limit!: number;

  @Field({
    description: 'Whether another page of results is available.',
  })
  hasNextPage!: boolean;
}
