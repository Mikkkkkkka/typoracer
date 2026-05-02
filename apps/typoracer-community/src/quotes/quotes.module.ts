import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuotesRecordsApiController } from './quotes-records-api.controller';
import { QuotesRecordsService } from './quotes-records.service';
import { QuotesApiController } from './quotes-api.controller';
import { QuotesController } from './quotes.controller';
import { QuotesRecordsEventsService } from './quotes-records-events.service';
import { QuotesService } from './quotes.service';

@Module({
  imports: [AuthModule],
  controllers: [
    QuotesApiController,
    QuotesController,
    QuotesRecordsApiController,
  ],
  providers: [QuotesService, QuotesRecordsService, QuotesRecordsEventsService],
  exports: [QuotesService, QuotesRecordsService, QuotesRecordsEventsService],
})
export class QuotesModule {}
