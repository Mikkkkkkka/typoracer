import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DiscussionsModule } from '../discussions/discussions.module';
import { UsersApiController } from './users-api.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule, DiscussionsModule],
  controllers: [UsersApiController, UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
