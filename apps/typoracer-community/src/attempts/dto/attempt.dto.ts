import { ApiProperty } from '@nestjs/swagger';

export class AttemptDto {
  @ApiProperty({ example: 42 })
  id!: number;

  @ApiProperty({ example: 1 })
  quoteId!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 97.4 })
  accuracy!: number;

  @ApiProperty({ example: 112.8 })
  wpm!: number;

  @ApiProperty({ example: 120.1 })
  maxRawWpm!: number;

  @ApiProperty({ example: '2026-04-18T12:00:00.000Z' })
  createdAt!: string;
}
