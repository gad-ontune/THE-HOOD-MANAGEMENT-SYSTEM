import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppLogger } from './common/logger/logger.service';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(AppLogger);

  app.useLogger(logger);

  app.setGlobalPrefix('api/v1');

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const uploadDir = join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
  app.useStaticAssets(uploadDir, { prefix: '/uploads' });

  app.enableShutdownHooks();

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('The Hood Hotel API')
      .setDescription('Hotel Management System REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Application running on http://localhost:${port}`, 'Bootstrap');
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'Bootstrap');
  logger.log(`Health check at http://localhost:${port}/api/v1/health`, 'Bootstrap');
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`API docs at http://localhost:${port}/api/docs`, 'Bootstrap');
  }
}
bootstrap();
