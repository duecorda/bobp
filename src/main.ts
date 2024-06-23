import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /*
  const server = app.getHttpServer();
  const timeout = 60 * 1000 * 10;
  server.setTimeout(timeout);
  server.keepAliveTimeout = 33000;
  server.headersTimeout = 35000;
  */

  app.enableCors({
    origin: true,
    methods: '*', // ['Get', 'Post', 'Put', 'Delete', 'Patch', 'Options'],
    allowedHeaders: '*', // ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 3600,
    exposedHeaders: ['Content-Range'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector))); 

  const config = new DocumentBuilder()
    .setTitle('BO-BP')
    .setDescription('APIs')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
