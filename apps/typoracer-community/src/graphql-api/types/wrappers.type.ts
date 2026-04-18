import { Field, ObjectType } from '@nestjs/graphql';
import { PageInfoType } from './pagination.input';
import { DiscussionReplyType, DiscussionType } from './discussion.type';
import { AttemptType, QuoteType } from './quote.type';
import { UserType } from './user.type';

@ObjectType({ description: 'A paginated list of users.' })
export class UserPageType {
  @Field(() => [UserType], {
    description: 'The users returned for the current page.',
  })
  items!: UserType[];

  @Field(() => PageInfoType, {
    description: 'Pagination metadata for the user list.',
  })
  pageInfo!: PageInfoType;
}

@ObjectType({ description: 'A paginated list of discussions.' })
export class DiscussionPageType {
  @Field(() => [DiscussionType], {
    description: 'The discussions returned for the current page.',
  })
  items!: DiscussionType[];

  @Field(() => PageInfoType, {
    description: 'Pagination metadata for the discussion list.',
  })
  pageInfo!: PageInfoType;
}

@ObjectType({ description: 'A paginated list of discussion replies.' })
export class DiscussionReplyPageType {
  @Field(() => [DiscussionReplyType], {
    description: 'The replies returned for the current page.',
  })
  items!: DiscussionReplyType[];

  @Field(() => PageInfoType, {
    description: 'Pagination metadata for the reply list.',
  })
  pageInfo!: PageInfoType;
}

@ObjectType({ description: 'A paginated list of quotes.' })
export class QuotePageType {
  @Field(() => [QuoteType], {
    description: 'The quotes returned for the current page.',
  })
  items!: QuoteType[];

  @Field(() => PageInfoType, {
    description: 'Pagination metadata for the quote list.',
  })
  pageInfo!: PageInfoType;
}

@ObjectType({ description: 'A paginated list of attempts.' })
export class AttemptPageType {
  @Field(() => [AttemptType], {
    description: 'The attempts returned for the current page.',
  })
  items!: AttemptType[];

  @Field(() => PageInfoType, {
    description: 'Pagination metadata for the attempt list.',
  })
  pageInfo!: PageInfoType;
}
