import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigModule } from './configs/config.module';
import { ConfigService } from './configs/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const configs = app.select(ConfigModule).get(ConfigService);
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      port: parseInt(configs.envConfig.REDIS_PORT),
      host: configs.envConfig.REDIS_HOST,
      retryAttempts: parseInt(configs.envConfig.REDIS_CONNECTION_RETRY),
      retryDelay: parseInt(configs.envConfig.REDIS_CONNECTION_RETRY_BACKOFF),
    },
  });
  await app.startAllMicroservices();
  await app.listen(configs.envConfig.HTTP_PORT);
}
bootstrap();
