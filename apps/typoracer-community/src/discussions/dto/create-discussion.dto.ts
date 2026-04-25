import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDiscussionDto {
  @ApiProperty({ example: 'How to improve raw speed?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 'Share drills for pushing beyond 100 WPM.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  excerpt!: string;

  @ApiProperty({ example: 'I have been stuck at 95 WPM for months...' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body!: string;
}
