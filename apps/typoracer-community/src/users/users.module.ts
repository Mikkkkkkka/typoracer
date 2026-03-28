import { Module } from '@nestjs/common';
import { DiscussionsModule } from '../discussions/discussions.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DiscussionsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
