import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { QuotesModule } from '../quotes/quotes.module';
import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';
import { QuoteAttemptsController } from './quote-attempts.controller';
import { UserAttemptsController } from './user-attempts.controller';

@Module({
  imports: [PrismaModule, QuotesModule],
  controllers: [
    AttemptsController,
    QuoteAttemptsController,
    UserAttemptsController,
  ],
  providers: [AttemptsService],
  exports: [AttemptsService],
})
export class AttemptsModule {}
