import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;
}
