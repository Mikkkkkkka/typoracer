import { ApiProperty } from '@nestjs/swagger';

export class QuoteSummaryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '/assets/typewriter.jpg' })
  image: string;

  @ApiProperty({ example: 'Vintage typewriter on a desk' })
  alt!: string;

  @ApiProperty({ example: 'The quick brown fox jumps over the lazy dog.' })
  text!: string;
}
