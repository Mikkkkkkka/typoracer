import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AttemptsModule } from '../attempts/attempts.module';
import { DiscussionsModule } from '../discussions/discussions.module';
import { UserResolver } from './user.resolver';
import { UsersApiController } from './users-api.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule, DiscussionsModule, AttemptsModule],
  controllers: [UsersApiController, UsersController],
  providers: [UsersService, UserResolver],
  exports: [UsersService],
})
export class UsersModule {}
