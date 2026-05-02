import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ example: 112 })
  wpm!: number;

  @ApiProperty({ example: 97 })
  accuracy!: number;

  @ApiProperty({ example: 5 })
  discussions!: number;
}
