import express, { Express } from 'express';
import cors from 'cors';
import { appConfig } from './config/index';
import { requestLogger } from './middleware/request-logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

export function createApp(): Express {
  const app = express();

  // 配置 CORS
  app.use(cors({
    origin: appConfig.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: appConfig.cors.credentials,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(requestLogger);

  // Swagger API 文档
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Lenbrary Server API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
  }));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
