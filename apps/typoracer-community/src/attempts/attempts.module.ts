import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { QuotesModule } from '../quotes/quotes.module';
import { AttemptsApiController } from './attempts-api.controller';
import { QuoteAttemptsApiController } from './quote-attempts-api.controller';
import { AttemptsService } from './attempts.service';
import { UserAttemptsApiController } from './user-attempts-api.controller';

@Module({
  imports: [PrismaModule, QuotesModule],
  controllers: [
    AttemptsApiController,
    QuoteAttemptsApiController,
    UserAttemptsApiController,
  ],
  providers: [AttemptsService],
  exports: [AttemptsService],
})
export class AttemptsModule {}
