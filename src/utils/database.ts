import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { appConfig } from '../config/index';
import logger from '../middleware/logger';

const dbPath = appConfig.database.path;
const schemaPath = appConfig.database.schemaPath;

const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

function initializeDatabase(): void {
  try {
    const schema = readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    logger.info('[Database] Database initialized successfully');
  } catch (error) {
    logger.error('[Database] Failed to initialize database', { error });
    throw error;
  }
}

initializeDatabase();

export default db;
