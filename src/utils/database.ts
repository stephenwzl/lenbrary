import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appConfig } from '../config/index';
import logger from '../middleware/logger';
import { MigrationService } from '../services/migration.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = appConfig.database.path;
const migrationsDir = join(__dirname, '../migrations');

// 确保数据库目录存在
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

async function initializeDatabase(): Promise<void> {
  try {
    // 使用迁移服务初始化数据库
    const migrationService = new MigrationService(db, {
      migrationsDir: migrationsDir,
      table: '__schema_migrations__',
    });

    // 自动运行待处理的迁移
    await migrationService.migrate();
    logger.info('[Database] Database initialized successfully with migrations');
  } catch (error) {
    logger.error('[Database] Failed to initialize database', { error });
    throw error;
  }
}

void initializeDatabase();

export default db;
