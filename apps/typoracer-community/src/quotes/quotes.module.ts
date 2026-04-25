import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuoteRecordsApiController } from './quote-records-api.controller';
import { QuoteRecordsService } from './quote-records.service';
import { QuotesApiController } from './quotes-api.controller';
import { QuotesController } from './quotes.controller';
import { QuotesRecordsEventsService } from './quotes-records-events.service';
import { QuotesService } from './quotes.service';

@Module({
  imports: [AuthModule],
  controllers: [
    QuotesApiController,
    QuotesController,
    QuoteRecordsApiController,
  ],
  providers: [QuotesService, QuoteRecordsService, QuotesRecordsEventsService],
  exports: [QuotesService, QuoteRecordsService, QuotesRecordsEventsService],
})
export class QuotesModule {}
