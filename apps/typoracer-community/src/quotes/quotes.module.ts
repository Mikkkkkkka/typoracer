import { Module } from '@nestjs/common';
import { QuoteRecordsEventsService } from './quote-records-events.service';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  controllers: [QuotesController],
  providers: [QuotesService, QuoteRecordsEventsService],
  exports: [QuotesService, QuoteRecordsEventsService],
})
export class QuotesModule {}
