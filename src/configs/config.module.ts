import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { TypeOrmConfigService } from './type-orm-config.service';

@Global()
@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(
        `env/${process.env.NODE_ENV || 'development'}.env`,
      ),
    },
    TypeOrmConfigService,
  ],
  exports: [ConfigService, TypeOrmConfigService],
})
export class ConfigModule {}
