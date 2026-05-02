import { ApiProperty } from '@nestjs/swagger';
import { DiscussionDto } from '../../discussions/dto/discussion.dto';
import { UserProfileDto } from './user-profile.dto';

export class UserProfileWithDiscussionsDto extends UserProfileDto {
  @ApiProperty({ type: DiscussionDto, isArray: true })
  discussions!: DiscussionDto[];
}
