import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType({ description: 'Input for creating a discussion reply.' })
export class CreateDiscussionReplyInput {
  @Field({
    description: 'The username of the reply author.',
  })
  @IsString()
  @IsNotEmpty()
  author!: string;

  @Field({
    description: 'The reply body text.',
  })
  @IsString()
  @IsNotEmpty()
  text!: string;
}
