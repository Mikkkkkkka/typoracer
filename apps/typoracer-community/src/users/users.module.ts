import { Module } from '@nestjs/common';
import { AttemptsModule } from '../attempts/attempts.module';
import { DiscussionsModule } from '../discussions/discussions.module';
import { UsersApiController } from './users-api.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DiscussionsModule, AttemptsModule],
  controllers: [UsersController, UsersApiController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
