import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // base url
  app.setGlobalPrefix('api/v1');

  // handling response
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
