import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

import { join } from 'path';
import layouts from 'express-ejs-layouts';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const publicPath = join(__dirname, '..', 'public');
  const viewsPath = join(__dirname, '..', 'views');

  app.useStaticAssets(publicPath);
  app.setBaseViewsDir(viewsPath);
  app.setViewEngine('ejs');

  app.set('layout', 'layouts/main');
  app.use(layouts);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
