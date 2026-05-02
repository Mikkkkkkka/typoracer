import { ApiProperty } from '@nestjs/swagger';
import { QuoteAuthorDto } from './quote-author.dto';
import { QuoteRecordEntryDto } from './quote-record-entry.dto';
import { QuoteSummaryDto } from './quote-summary.dto';

export class QuoteDetailDto extends QuoteSummaryDto {
  @ApiProperty({ type: QuoteAuthorDto })
  author!: QuoteAuthorDto;

  @ApiProperty({ example: 'April 18, 2026' })
  createdAt!: string;

  @ApiProperty({ type: QuoteRecordEntryDto, isArray: true })
  records!: QuoteRecordEntryDto[];
}
