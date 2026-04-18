import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDiscussionReplyDto {
  @ApiProperty({ example: 'SpeedyFox' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  author!: string;

  @ApiProperty({ example: 'This quote is brutal on the last line.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text!: string;
}
