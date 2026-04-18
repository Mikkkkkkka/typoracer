import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttemptDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quoteId!: number;

  @ApiProperty({ example: 7 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  userId!: number;

  @ApiProperty({ example: 97.4 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  accuracy!: number;

  @ApiProperty({ example: 112.8 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  wpm!: number;

  @ApiPropertyOptional({ example: 120.1 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxRawWpm?: number;
}
