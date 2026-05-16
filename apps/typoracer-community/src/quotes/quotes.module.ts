import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { QuoteResolver } from './quote.resolver';
import { QuotesRecordsApiController } from './quotes-records-api.controller';
import { QuotesRecordsService } from './quotes-records.service';
import { QuotesApiController } from './quotes-api.controller';
import { QuotesController } from './quotes.controller';
import { QuotesRecordsEventsService } from './quotes-records-events.service';
import { QuotesService } from './quotes.service';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [
    QuotesApiController,
    QuotesController,
    QuotesRecordsApiController,
  ],
  providers: [
    QuotesService,
    QuotesRecordsService,
    QuotesRecordsEventsService,
    QuoteResolver,
  ],
  exports: [QuotesService, QuotesRecordsService, QuotesRecordsEventsService],
})
export class QuotesModule {}
