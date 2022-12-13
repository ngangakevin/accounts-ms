import { Module } from '@nestjs/common';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './configs/config.module';
import { TypeOrmConfigService } from './configs/type-orm-config.service';
import { EntitiesModule } from './entities/entities.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [
    EntitiesModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useExisting: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        return await new DataSource(options).initialize();
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(
    @InjectDataSource()
    private datasource: DataSource,
  ) {}
}
