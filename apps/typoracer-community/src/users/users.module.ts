import { Module } from '@nestjs/common';
import { DiscussionsModule } from '../discussions/discussions.module';
import { UsersApiController } from './users-api.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DiscussionsModule],
  controllers: [UsersController, UsersApiController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
