import { ApiProperty } from '@nestjs/swagger';

export class QuoteRecordEntryDto {
  @ApiProperty({ example: 'SpeedyFox' })
  username!: string;

  @ApiProperty({ example: 112 })
  wpm!: number;

  @ApiProperty({ example: 98 })
  accuracy!: number;
}
