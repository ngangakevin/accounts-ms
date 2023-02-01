import * as path from 'path';
import * as dotenv from 'dotenv';
import { ConfigService } from './config.service';
import { DataSource } from 'typeorm';

dotenv.config({ path: __dirname + '../../env/development.env' });

const configDir = path.join(__dirname, '../../env/development.env');

const config = new ConfigService(configDir);
export default new DataSource(config.getTypeormConfig());
