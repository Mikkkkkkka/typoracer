import { Module } from '@nestjs/common';
import { DiscussionsModule } from './discussions/discussions.module';
import { PagesModule } from './pages/pages.module';
import { QuotesModule } from './quotes/quotes.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [QuotesModule, DiscussionsModule, UsersModule, PagesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
