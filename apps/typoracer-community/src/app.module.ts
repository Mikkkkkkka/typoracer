import { Module } from '@nestjs/common';
import { PagesModule } from './pages/pages.module';

@Module({
  imports: [PagesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
