import { ApiProperty } from '@nestjs/swagger';

export class DiscussionReplyDto {
  @ApiProperty({ example: 12 })
  id!: number;

  @ApiProperty({ example: 'SpeedyFox' })
  author!: string;

  @ApiProperty({ example: 'This quote is brutal on the last line.' })
  text!: string;
}
