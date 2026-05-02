import { Module } from '@nestjs/common';
import { AttemptsModule } from '../attempts/attempts.module';
import { DiscussionsModule } from '../discussions/discussions.module';
import { QuotesModule } from '../quotes/quotes.module';
import { UsersModule } from '../users/users.module';
import { AttemptsResolver } from './resolvers/attempts.resolver';
import {
  DiscussionRepliesResolver,
  DiscussionsResolver,
} from './resolvers/discussions.resolver';
import { QuotesResolver } from './resolvers/quotes.resolver';
import { UsersResolver } from './resolvers/users.resolver';

@Module({
  imports: [UsersModule, DiscussionsModule, QuotesModule, AttemptsModule],
  providers: [
    UsersResolver,
    DiscussionsResolver,
    DiscussionRepliesResolver,
    QuotesResolver,
    AttemptsResolver,
  ],
})
export class GraphqlApiModule {}
