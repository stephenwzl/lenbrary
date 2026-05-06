import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface TestEnv {
  root: string;
  dbPath: string;
  uploadDir: string;
  tempDir: string;
  cleanup: () => void;
}

export function createTestEnv(): TestEnv {
  const root = mkdtempSync(join(tmpdir(), 'lenbrary-test-'));
  const env = {
    root,
    dbPath: join(root, 'data/assets.db'),
    uploadDir: join(root, 'uploads'),
    tempDir: join(root, 'tmp'),
  };
  process.env.DB_PATH = env.dbPath;
  process.env.UPLOAD_DIR = env.uploadDir;
  process.env.TEMP_DIR = env.tempDir;
  return {
    ...env,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}
