import { ApiProperty } from '@nestjs/swagger';
import { DiscussionReplyDto } from './discussion-reply.dto';

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
