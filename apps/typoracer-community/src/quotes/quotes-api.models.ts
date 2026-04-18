import { ApiProperty } from '@nestjs/swagger';

export class QuoteAuthorDto {
  @ApiProperty({ example: 'TypeWriter' })
  username!: string;
}

export class QuoteRecordEntryDto {
  @ApiProperty({ example: 'SpeedyFox' })
  username!: string;

  @ApiProperty({ example: 112 })
  wpm!: number;

  @ApiProperty({ example: 98 })
  accuracy!: number;
}

export class QuoteSummaryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '/assets/typewriter.jpg' })
  image!: string;

  @ApiProperty({ example: 'Vintage typewriter on a desk' })
  alt!: string;

  @ApiProperty({ example: 'The quick brown fox jumps over the lazy dog.' })
  text!: string;
}

export class QuoteDetailDto extends QuoteSummaryDto {
  @ApiProperty({ type: QuoteAuthorDto })
  author!: QuoteAuthorDto;

  @ApiProperty({ example: 'April 18, 2026' })
  createdAt!: string;

  @ApiProperty({ type: QuoteRecordEntryDto, isArray: true })
  records!: QuoteRecordEntryDto[];
}

export class QuoteRecordsPayloadDto {
  @ApiProperty({ example: 1 })
  quoteId!: number;

  @ApiProperty({ type: QuoteRecordEntryDto, isArray: true })
  records!: QuoteRecordEntryDto[];

  @ApiProperty({ example: '2026-04-18T12:00:00.000Z' })
  updatedAt!: string;
}
