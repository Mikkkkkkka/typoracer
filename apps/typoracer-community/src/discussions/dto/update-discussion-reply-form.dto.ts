import { IsString } from 'class-validator';

export class UpdateDiscussionReplyFormDto {
  @IsString()
  text!: string;
}
