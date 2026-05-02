import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PagesController } from './pages.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [PagesController],
})
export class PagesModule {}
