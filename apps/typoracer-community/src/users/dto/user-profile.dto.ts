import { ApiProperty } from '@nestjs/swagger';
import { UserStatsDto } from './user-stats.dto';

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
