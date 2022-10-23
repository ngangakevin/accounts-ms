import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      port: parseInt(process.env.REDIS_PORT),
      host: process.env.REDIS_HOST,
      retryAttempts: parseInt(process.env.REDIS_CONNECTION_RETRY),
      retryDelay: parseInt(process.env.REDIS_CONNECTION_RETRY_BACKOFF),
    }
  })
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
