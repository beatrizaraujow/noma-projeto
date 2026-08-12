import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set. Aborting.');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Atrás de proxy (Railway): confia na cadeia de proxies para que req.ip
  // reflita o X-Forwarded-For. O IP usado pelo rate limiting é resolvido de
  // forma robusta no getTracker do ThrottlerModule (IP público mais à direita),
  // porque 'trust proxy = 1' resolvia para um IP de borda do Railway que rotaciona.
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  // FRONTEND_URL e a origem principal. CORS_ORIGINS aceita uma lista separada por
  // virgula para origens extras (dominio antigo durante uma migracao, preview,
  // etc.) sem exigir novo build da imagem — a origem fixa da Vercel que existia
  // aqui deixou de valer com a migracao para o Hostinger.
  const extraOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    ...extraOrigins,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NexORA API')
    .setDescription('Enterprise Task Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('tasks')
    .addTag('projects')
    .addTag('users')
    .addTag('auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
