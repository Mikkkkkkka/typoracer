import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuoteSubmissionResponseDto {
  @ApiProperty({ example: 42 })
  id!: number;

  @ApiProperty({ example: 'The quick brown fox jumps over the lazy dog.' })
  text!: string;

  @ApiPropertyOptional({ example: 'Unknown', nullable: true })
  source!: string | null;

  @ApiProperty({ example: 'SUBMITTED' })
  status!: 'SUBMITTED';
}
