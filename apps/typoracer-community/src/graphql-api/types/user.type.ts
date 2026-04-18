import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AttemptPageType, DiscussionPageType } from './wrappers.type';

@ObjectType({ description: 'Aggregated typing statistics for a user.' })
export class UserStatsType {
  @Field(() => Int, {
    description: 'The best recorded words-per-minute result.',
  })
  wpm!: number;

  @Field(() => Int, {
    description: 'The average typing accuracy across attempts.',
  })
  accuracy!: number;

  @Field(() => Int, {
    description: 'The number of discussions created by the user.',
  })
  discussions!: number;
}

@ObjectType({ description: 'A community member profile.' })
export class UserType {
  @Field({
    description: 'The public username.',
  })
  username!: string;

  @Field({
    description: 'A formatted month and year when the user joined.',
  })
  joinedAt!: string;

  @Field({
    description: 'The user biography shown on the profile page.',
  })
  bio!: string;

  @Field(() => UserStatsType, {
    description: 'The computed user statistics.',
  })
  stats?: UserStatsType;

  @Field(() => DiscussionPageType, {
    description: 'Discussions created by the user.',
  })
  discussions?: DiscussionPageType;

  @Field(() => AttemptPageType, {
    description: 'Typing attempts created by the user.',
  })
  attempts?: AttemptPageType;

  userId?: number;
}
