import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { QuotesModule } from '../quotes/quotes.module';
import { AttemptResolver } from './attempt.resolver';
import { AttemptsController } from './attempts.controller';
import { AttemptsApiController } from './attempts-api.controller';
import { QuoteAttemptsApiController } from './quote-attempts-api.controller';
import { AttemptsService } from './attempts.service';
import { UserAttemptsApiController } from './user-attempts-api.controller';

@Module({
  imports: [PrismaModule, QuotesModule, AuthModule],
  controllers: [
    AttemptsController,
    AttemptsApiController,
    QuoteAttemptsApiController,
    UserAttemptsApiController,
  ],
  providers: [AttemptsService, AttemptResolver],
  exports: [AttemptsService],
})
export class AttemptsModule {}
