import { ApiProperty } from '@nestjs/swagger';

export class DiscussionReplyDto {
  @ApiProperty({ example: 'SpeedyFox' })
  author!: string;

  @ApiProperty({ example: 'This quote is brutal on the last line.' })
  text!: string;
}

export class DiscussionDto {
  @ApiProperty({ example: 3 })
  id!: number;

  @ApiProperty({ example: 'How to improve raw speed?' })
  title!: string;

  @ApiProperty({ example: 'KeyMaster' })
  author!: string;

  @ApiProperty({ example: 'Share drills for pushing beyond 100 WPM.' })
  excerpt!: string;

  @ApiProperty({ example: 'I have been stuck at 95 WPM for months...' })
  body!: string;

  @ApiProperty({ type: DiscussionReplyDto, isArray: true })
  replies!: DiscussionReplyDto[];
}

export class DiscussionReplyEnvelopeDto {
  @ApiProperty({ type: DiscussionReplyDto })
  reply!: DiscussionReplyDto;
}
