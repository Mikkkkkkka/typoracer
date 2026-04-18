import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';
import { DiscussionReplyPageType } from './wrappers.type';

@ObjectType({ description: 'A reply inside a discussion thread.' })
export class DiscussionReplyType {
  @Field({
    description: 'The textual reply body.',
  })
  text!: string;

  @Field(() => UserType, {
    description: 'The author of the reply.',
  })
  author?: UserType;

  authorUsername?: string;
}

@ObjectType({ description: 'A discussion thread in the community forum.' })
export class DiscussionType {
  @Field(() => Int, {
    description: 'The discussion identifier.',
  })
  id!: number;

  @Field({
    description: 'The discussion title.',
  })
  title!: string;

  @Field({
    description: 'A short excerpt used in discussion lists.',
  })
  excerpt!: string;

  @Field({
    description: 'The full discussion body.',
  })
  body!: string;

  @Field(() => UserType, {
    description: 'The author of the discussion.',
  })
  author?: UserType;

  @Field(() => DiscussionReplyPageType, {
    description: 'Replies posted in the discussion.',
  })
  replies?: DiscussionReplyPageType;

  authorUsername?: string;
}
