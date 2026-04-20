import { ApiProperty } from '@nestjs/swagger';

export class QuoteAuthorDto {
  @ApiProperty({ example: 'TypeWriter' })
  username!: string;
}
