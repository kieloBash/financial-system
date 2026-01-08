import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  // Enable CORS for Next.js frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global JWT auth guard (all routes protected by default)
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global validation pipe
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

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}/api`);
}
bootstrap();
