import { Logger } from '@nestjs/common';
import * as path from 'path';

const logger = new Logger();
const env = process.env.NODE_ENV || 'development';
const p = path.join(process.cwd(), `env/${env}.env`);
logger.log(`Loading environment from ${p}`);
const dotEnvOptions = {
  path: p,
};

export { dotEnvOptions };
