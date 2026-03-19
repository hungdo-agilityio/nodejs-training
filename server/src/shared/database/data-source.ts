import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { DATABASE_PATH } from '../constants';

// eslint-disable-next-line no-undef
const isCompiled = __dirname.includes('dist');
const entityExt = isCompiled ? 'js' : 'ts';
const entityBase = isCompiled ? 'dist' : 'src';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: DATABASE_PATH,
  synchronize: false, // Never use in production
  logging: false,
  entities: [`${entityBase}/modules/**/entities/*.${entityExt}`],
  migrations: [`${entityBase}/shared/database/migrations/*.${entityExt}`],
  subscribers: [],
});
