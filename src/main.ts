import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable cors
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://subul-platform-k9e7168cw-ahmedmohamedc45-5557s-projects.vercel.app',
    ],
    credentials: true,
  });

  // base url
  app.setGlobalPrefix('api/v1');

  // handling response
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger
  // http://localhost:3000/api/docs
  const config = new DocumentBuilder()
    .setTitle('Courses Platform API')
    .setDescription('API documentation for the Courses Platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addCookieAuth('refreshToken')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('User', 'User management')
    .addTag('Course', 'Course management')
    .addTag('Category', 'Category management')
    .addTag('Lesson', 'Lesson management')
    .addTag('Review', 'Review management')
    .addTag('Enrollment', 'Course enrollment')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
