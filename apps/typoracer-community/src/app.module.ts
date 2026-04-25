import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { PagesModule } from './pages/pages.module';
import { PrismaModule } from './prisma/prisma.module';
import { QuotesModule } from './quotes/quotes.module';
import { UsersModule } from './users/users.module';
import { AttemptsModule } from './attempts/attempts.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    QuotesModule,
    DiscussionsModule,
    UsersModule,
    PagesModule,
    AttemptsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
