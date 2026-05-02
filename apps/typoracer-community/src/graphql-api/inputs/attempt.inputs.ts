import { Field, Float, InputType, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

@InputType({ description: 'Input for creating a new typing attempt.' })
export class CreateAttemptInput {
  @Field(() => Int, {
    description: 'The quote identifier.',
  })
  @IsInt()
  @Min(1)
  quoteId!: number;

  @Field(() => Int, {
    description: 'The user identifier.',
  })
  @IsInt()
  @Min(1)
  userId!: number;

  @Field(() => Float, {
    description: 'The typing accuracy percentage.',
  })
  @IsNumber()
  accuracy!: number;

  @Field(() => Float, {
    description: 'The words per minute score.',
  })
  @IsNumber()
  wpm!: number;

  @Field(() => Float, {
    description: 'The maximum raw words per minute.',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  maxRawWpm?: number;
}

@InputType({ description: 'Input for updating an existing typing attempt.' })
export class UpdateAttemptInput extends PartialType(CreateAttemptInput) {}
