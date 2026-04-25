import { ApiProperty } from '@nestjs/swagger';
import { DiscussionReplyDto } from './discussion-reply.dto';

export class DiscussionReplyEnvelopeDto {
  @ApiProperty({ type: DiscussionReplyDto })
  reply!: DiscussionReplyDto;
}
