import { Module } from '@nestjs/common';
import { QuoteRecordsEventsService } from './quote-records-events.service';
import { QuotesApiController } from './quotes-api.controller';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  controllers: [QuotesController, QuotesApiController],
  providers: [QuotesService, QuoteRecordsEventsService],
  exports: [QuotesService, QuoteRecordsEventsService],
})
export class QuotesModule {}
