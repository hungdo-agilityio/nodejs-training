import { bootstrap, shutdown } from './bootstrap';
import { PORT } from '@shared/constants';
import { ILogger } from '@shared/types';

const gracefulShutdown = async (
  signal: string,
  logger: ILogger
): Promise<void> => {
  logger.log(`${signal} received.`);

  try {
    await shutdown();
    process.exit(0);
  } catch {
    process.exit(1);
  }
};

const startServer = async (): Promise<void> => {
  try {
    const { app, logger } = await bootstrap();

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM', logger));
    process.on('SIGINT', () => gracefulShutdown('SIGINT', logger));

    app.listen(PORT, () => {
      logger.log(`Server is running on port ${PORT}`);
      logger.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
