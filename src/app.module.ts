import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService, TypeOrmConfigService } from '@configs';
import { EntitiesModule } from '@entities';
import { ClientProxyFactory, ClientsModule } from '@nestjs/microservices';

@Module({
  imports: [
    EntitiesModule,
    ClientsModule.registerAsync([
      {
        name: 'ACCOUNTS_SERVICE',
        useFactory: (configService: ConfigService) => {
          const microserviceOptions = configService.getMicroserviceConfig();
          return microserviceOptions;
        },
        inject: [ConfigService],
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [EntitiesModule, ConfigModule],
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        return await new DataSource(options).initialize();
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'ACCOUNTS_SERVICE',
      useFactory: (configService: ConfigService) => {
        const accServiceOptions = configService.getMicroserviceConfig();
        return ClientProxyFactory.create(accServiceOptions);
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
