import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

import { join } from 'path';
import hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const publicPath = join(__dirname, '..', 'public');
  const viewsPath = join(__dirname, '..', 'views');

  app.useStaticAssets(publicPath);
  app.setBaseViewsDir(viewsPath);
  app.setViewEngine('hbs');

  hbs.registerPartials(join(viewsPath, 'layouts'));
  hbs.registerPartials(join(viewsPath, 'partials'));
  hbs.registerHelper('eq', (a: string, b: string) => a === b);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
