import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from '@hapi/joi';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { IEnvConfig } from 'src/common/interfaces/env-config.interface';
import { DataSourceOptions } from 'typeorm';
import { Transport, RedisOptions } from '@nestjs/microservices';

@Injectable()
export class ConfigService {
  readonly envConfig: IEnvConfig;

  constructor(filepath: string) {
    const config = dotenv.parse(fs.readFileSync(filepath));
    this.envConfig = this.validateInput(config);
  }

  public getTypeormConfig(): DataSourceOptions {
    const baseDir = path.join(__dirname, '../../');
    const entitiesPath = `${baseDir}${this.envConfig.TYPEORM_ENTITIES}`;
    const migrationPath = `${baseDir}${this.envConfig.TYPEORM_MIGRATIONS}`;
    const type: any = this.envConfig.TYPEORM_CONNECTION;
    return {
      type,
      host: this.envConfig.TYPEORM_HOST,
      username: this.envConfig.TYPEORM_USERNAME,
      password: this.envConfig.TYPEORM_PASSWORD,
      port: parseInt(this.envConfig.TYPEORM_PORT),
      logging: false,
      entities: [entitiesPath],
      migrations: [migrationPath],
      migrationsRun: this.envConfig.TYPEORM_MIGRATIONS_RUN === 'true',
      synchronize: true,
    };
  }

  public getMicroserviceConfig(): RedisOptions {
    return {
      transport: Transport.REDIS,
      options: {
        port: parseInt(this.envConfig.REDIS_PORT),
        host: this.envConfig.REDIS_HOST,
        retryAttempts: parseInt(this.envConfig.REDIS_CONNECTION_RETRY),
        retryDelay: parseInt(this.envConfig.REDIS_CONNECTION_RETRY_BACKOFF),
      },
    };
  }

  private validateInput(config: IEnvConfig): IEnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid('development', 'test')
        .default('development'),
      HTTP_PORT: Joi.number().required(),
    }).unknown(true);

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(
      config,
      { abortEarly: false },
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }
}
