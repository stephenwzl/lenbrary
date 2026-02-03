import { config } from 'dotenv';

config();

export interface AppConfig {
  port: number;
  upload: {
    dir: string;
    maxSize: number;
    tempDir: string;
  };
  assets: {
    thumbnailSize: number;
  };
  database: {
    path: string;
    schemaPath: string;
    migrationsDir: string;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
}

export const appConfig: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxSize: Infinity,
    tempDir: process.env.TEMP_DIR || './tmp',
  },
  assets: {
    thumbnailSize: parseInt(process.env.THUMBNAIL_SIZE || '512', 10),
  },
  database: {
    path: process.env.DB_PATH || './data/assets.db',
    schemaPath: './src/config/schema.sql',
    migrationsDir: './src/migrations',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};
