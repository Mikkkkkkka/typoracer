import { Module } from '@nestjs/common';
import { DiscussionsApiController } from './discussions-api.controller';
import { DiscussionsController } from './discussions.controller';
import { DiscussionsService } from './discussions.service';
import { UserDiscussionsController } from './user-discussions.controller';

@Module({
  controllers: [
    DiscussionsController,
    DiscussionsApiController,
    UserDiscussionsController,
  ],
  providers: [DiscussionsService],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
