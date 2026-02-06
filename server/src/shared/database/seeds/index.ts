import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { seedServices } from './services.seed';

const runSeeds = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    await seedServices(AppDataSource);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
};

runSeeds();
