import { IsString } from 'class-validator';

export class CreateDiscussionFormDto {
  @IsString()
  title!: string;

  @IsString()
  excerpt!: string;

  @IsString()
  body!: string;
}
