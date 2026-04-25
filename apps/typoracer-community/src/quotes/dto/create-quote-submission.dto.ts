import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateQuoteSubmissionDto {
  @ApiProperty({ example: 'The quick brown fox jumps over the lazy dog.' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  text!: string;

  @ApiPropertyOptional({ example: 'Unknown' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;
}
