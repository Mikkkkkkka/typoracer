import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';
import { AttemptPageType } from './wrappers.type';

@ObjectType({ description: 'A user record on a quote leaderboard.' })
export class QuoteRecordEntryType {
  @Field({
    description: 'The username that owns the record.',
  })
  username!: string;

  @Field(() => Int, {
    description: 'The rounded words-per-minute score.',
  })
  wpm!: number;

  @Field(() => Int, {
    description: 'The rounded accuracy percentage.',
  })
  accuracy!: number;
}

@ObjectType({ description: 'A payload with current quote records.' })
export class QuoteRecordsPayloadType {
  @Field(() => Int, {
    description: 'The quote identifier.',
  })
  quoteId!: number;

  @Field(() => [QuoteRecordEntryType], {
    description: 'The best per-user records for the quote.',
  })
  records!: QuoteRecordEntryType[];

  @Field({
    description: 'The ISO timestamp when the payload was generated.',
  })
  updatedAt!: string;
}

@ObjectType({ description: 'A quote available for typing challenges.' })
export class QuoteType {
  @Field(() => Int, {
    description: 'The quote identifier.',
  })
  id!: number;

  @Field({
    description: 'The public URL of the quote image.',
  })
  image!: string;

  @Field({
    description: 'Alternative text for the quote image.',
  })
  alt!: string;

  @Field({
    description: 'The quote text itself.',
  })
  text!: string;

  @Field({
    description: 'A formatted creation date string.',
  })
  createdAt?: string;

  @Field(() => UserType, {
    description: 'The user who submitted the quote.',
  })
  author?: UserType;

  @Field(() => [QuoteRecordEntryType], {
    description: 'Current leaderboard entries for the quote.',
  })
  records?: QuoteRecordEntryType[];

  @Field(() => AttemptPageType, {
    description: 'Attempts made for this quote.',
  })
  attempts?: AttemptPageType;

  authorUsername?: string;
}

@ObjectType({ description: 'A typing attempt submitted for a quote.' })
export class AttemptType {
  @Field(() => Int, {
    description: 'The attempt identifier.',
  })
  id!: number;

  @Field(() => Int, {
    description: 'The related quote identifier.',
  })
  quoteId!: number;

  @Field(() => Int, {
    description: 'The related user identifier.',
  })
  userId!: number;

  @Field(() => Float, {
    description: 'The typing accuracy percentage.',
  })
  accuracy!: number;

  @Field(() => Float, {
    description: 'The measured words per minute.',
  })
  wpm!: number;

  @Field(() => Float, {
    description: 'The maximum raw words per minute during the attempt.',
  })
  maxRawWpm!: number;

  @Field({
    description: 'The ISO timestamp when the attempt was created.',
  })
  createdAt!: string;

  @Field(() => UserType, {
    description: 'The user who made the attempt.',
  })
  user?: UserType;

  @Field(() => QuoteType, {
    description: 'The quote for which the attempt was made.',
  })
  quote?: QuoteType;
}
