import { ApiProperty } from '@nestjs/swagger';
import { QuoteRecordEntryDto } from './quote-record-entry.dto';

export class QuoteRecordsPayloadDto {
  @ApiProperty({ example: 1 })
  quoteId!: number;

  @ApiProperty({ type: QuoteRecordEntryDto, isArray: true })
  records!: QuoteRecordEntryDto[];

  @ApiProperty({ example: '2026-04-18T12:00:00.000Z' })
  updatedAt!: string;
}
