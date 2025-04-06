import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  const port = configService.get<number>('APP_PORT', 3001);

  app.enableCors();
  await app.listen(port, '0.0.0.0'); // Écoute sur toutes les interfaces
  console.log(`Backend service is running on port: ${port}`);
}
bootstrap();
