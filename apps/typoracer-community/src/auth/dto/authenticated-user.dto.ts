import { ApiProperty } from '@nestjs/swagger';

export class AuthenticatedUserDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  username!: string;
}
