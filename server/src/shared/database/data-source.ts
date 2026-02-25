import 'reflect-metadata';
import { DataSource } from 'typeorm';

const DATABASE_PATH = process.env.DATABASE_PATH || './data/salon_booking.db';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: DATABASE_PATH,
  synchronize: false, // Never use in production
  logging: false,
  entities: ['src/modules/**/entities/*.ts'],
  migrations: ['src/shared/database/migrations/*.ts'],
  subscribers: [],
});
