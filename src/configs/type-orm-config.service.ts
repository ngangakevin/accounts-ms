import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from './config.service';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configs: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return this.configs.getTypeormConfig();
  }
}
