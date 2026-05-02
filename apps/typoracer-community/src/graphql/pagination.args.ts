import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, {
    defaultValue: 1,
    description: '1-based page number.',
    complexity: 1,
  })
  @Min(1)
  page: number = 1;

  @Field(() => Int, {
    defaultValue: 20,
    description: 'Maximum number of items to return.',
    complexity: 1,
  })
  @Min(1)
  @Max(50)
  limit: number = 20;
}
