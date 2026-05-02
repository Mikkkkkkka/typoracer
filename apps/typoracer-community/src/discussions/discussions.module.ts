import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DiscussionResolver } from './discussion.resolver';
import { DiscussionsApiController } from './discussions-api.controller';
import { DiscussionsController } from './discussions.controller';
import { DiscussionsService } from './discussions.service';
import { UserDiscussionsController } from './user-discussions.controller';

@Module({
  imports: [AuthModule],
  controllers: [
    DiscussionsController,
    DiscussionsApiController,
    UserDiscussionsController,
  ],
  providers: [DiscussionsService, DiscussionResolver],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
