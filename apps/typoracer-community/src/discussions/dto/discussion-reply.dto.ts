import { ApiProperty } from '@nestjs/swagger';

export class DiscussionReplyDto {
  @ApiProperty({ example: 'SpeedyFox' })
  author!: string;

  @ApiProperty({ example: 'This quote is brutal on the last line.' })
  text!: string;
}
