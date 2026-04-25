import { ApiProperty } from '@nestjs/swagger';

export class UserSummaryDto {
  @ApiProperty({ example: 'SpeedyFox' })
  username!: string;

  @ApiProperty({ example: 'April 2026' })
  joinedAt!: string;

  @ApiProperty({ example: 'Mechanical keyboard enthusiast.', nullable: true })
  bio!: string | null;
}
