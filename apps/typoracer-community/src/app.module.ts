import { Module } from '@nestjs/common';
import { PagesModule } from './pages/pages.module';
import { QuotesModule } from './quotes/quotes.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PagesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
