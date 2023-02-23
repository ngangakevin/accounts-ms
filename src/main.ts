import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigModule } from './configs/config.module';
import { ConfigService } from './configs/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const configs = app.select(ConfigModule).get(ConfigService);
  const swaggerConfigs = new DocumentBuilder()
    .setTitle('Accounts Service')
    .setDescription(
      'Service responsible for all acocunts mutations' +
        ' including creation, deposits, transfers, freeze and unfreezing.',
    )
    .setVersion('1.0')
    .addTag('accounts')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfigs);
  SwaggerModule.setup('accounts/api', app, document);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
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
