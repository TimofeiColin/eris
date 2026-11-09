import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { validateEnv } from './env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const env = validateEnv(process.env);

  app.enableShutdownHooks();
  app.enableCors();

  app.setGlobalPrefix(env.API_PREFIX, { exclude: ['mcp'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, stopAtFirstError: true }));

  if (process.env.NODE_ENV === 'development') {
    const swaggerConfig = new DocumentBuilder().setTitle('Eris API').addBearerAuth().build();
    SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, swaggerConfig), {
      useGlobalPrefix: true,
    });
  }

  await app.listen(env.PORT, '0.0.0.0');
}
bootstrap();
