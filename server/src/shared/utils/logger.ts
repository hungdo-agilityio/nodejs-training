import { ILogger } from '@shared/types';

// ConsoleLogger intentionally uses console.log/info for its logging implementation
/* eslint-disable no-console */
export class ConsoleLogger implements ILogger {
  log(message: string): void {
    console.log(`[LOG] ${new Date().toISOString()} - ${message}`);
  }

  error(message: string, error?: Error): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      console.error(error.stack);
    }
  }

  warn(message: string): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  }

  info(message: string): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  }
}
