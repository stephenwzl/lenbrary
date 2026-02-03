import { appConfig } from './config/index';
import createApp from './app';
import logger from './middleware/logger';

const app = createApp();

const server = app.listen(appConfig.port, () => {
  logger.info(`Server is running on port ${appConfig.port}`);
  logger.info(`Upload directory: ${appConfig.upload.dir}`);
  logger.info(`Database path: ${appConfig.database.path}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received, closing server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received, closing server gracefully');
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
