import { ApiProperty } from '@nestjs/swagger';
import { DiscussionDto } from '../discussions/discussions-api.models';

export class UserStatsDto {
  @ApiProperty({ example: 112 })
  wpm!: number;

  @ApiProperty({ example: 97 })
  accuracy!: number;

  @ApiProperty({ example: 5 })
  discussions!: number;
}

export class UserProfileDto {
  @ApiProperty({ example: 'SpeedyFox' })
  username!: string;

  @ApiProperty({ example: 'April 2026' })
  joinedAt!: string;

  @ApiProperty({ example: 'Mechanical keyboard enthusiast.' })
  bio!: string;

  @ApiProperty({ type: UserStatsDto })
  stats!: UserStatsDto;
}

export class UserProfileWithDiscussionsDto extends UserProfileDto {
  @ApiProperty({ type: DiscussionDto, isArray: true })
  discussions!: DiscussionDto[];
}
