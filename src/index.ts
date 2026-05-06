import { appConfig } from './config/index';
import createApp from './app';
import logger from './middleware/logger';
import { databaseReady } from './utils/database';

const app = createApp();

let server: ReturnType<typeof app.listen>;

databaseReady
  .then(() => {
    server = app.listen(appConfig.port, () => {
      logger.info(`Server is running on port ${appConfig.port}`);
      logger.info(`Upload directory: ${appConfig.upload.dir}`);
      logger.info(`Database path: ${appConfig.database.path}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to initialize database before startup', { error });
    process.exit(1);
  });

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received, closing server gracefully');
  if (!server) {
    process.exit(0);
  }
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received, closing server gracefully');
  if (!server) {
    process.exit(0);
  }
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

export default app;
