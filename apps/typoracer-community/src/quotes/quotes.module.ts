import { Module } from '@nestjs/common';
import { QuoteRecordsController } from './quote-records.controller';
import { QuoteRecordsService } from './quote-records.service';
import { QuotesApiController } from './quotes-api.controller';
import { QuotesController } from './quotes.controller';
import { QuotesRecordsEventsService } from './quotes-records-events.service';
import { QuotesService } from './quotes.service';

@Module({
  controllers: [QuotesApiController, QuotesController, QuoteRecordsController],
  providers: [QuotesService, QuoteRecordsService, QuotesRecordsEventsService],
  exports: [QuotesService, QuoteRecordsService, QuotesRecordsEventsService],
})
export class QuotesModule {}
