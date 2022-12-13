import * as path from 'path';

const env = process.env.NODE_ENV || 'development';
const p = path.join(process.cwd(), `env/${env}.env`);
console.log(`Loading environment from ${p}`);
const dotEnvOptions = {
  path: p,
};

export { dotEnvOptions };
