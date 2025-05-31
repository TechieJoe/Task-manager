import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as methodOverride from 'method-override';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { CurrentUserMiddleware } from './utils/current.user';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setViewEngine('ejs');
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public')); // for CSS/JS/images
  app.use(methodOverride('_method'));
  app.use(cookieParser());
  app.use(new CurrentUserMiddleware().use);
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


