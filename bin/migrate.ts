#!/usr/bin/env node

import Database from 'better-sqlite3';
import { existsSync } from 'node:fs';
import { config } from 'dotenv';
import { MigrationService } from '../src/services/migration.service.js';
import { appConfig } from '../src/config/index.js';

// 加载环境变量
config();

const dbPath = appConfig.database.path;
const migrationsDir = appConfig.database.migrationsDir;

// 检查数据库是否存在
if (!existsSync(dbPath)) {
  console.error('错误: 数据库文件不存在，请先运行一次应用来初始化数据库');
  process.exit(1);
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('用法:');
    console.log('  npm run migrate status    - 查看迁移状态');
    console.log('  npm run migrate up        - 执行待处理的迁移');
    console.log('  npm run migrate down      - 回滚到指定版本（需要提供版本号）');
    console.log('  npm run migrate info      - 显示详细迁移信息');
    console.log('');
    console.log('示例:');
    console.log('  npm run migrate down 2    - 回滚到版本 2');
    console.log('  npm run migrate create add_user_table - 创建新的迁移文件（使用模板）');
    process.exit(0);
  }

  const migrationService = new MigrationService(db, {
    migrationsDir,
    table: '__schema_migrations__',
  });

  try {
    switch (command) {
      case 'status':
        await handleStatus(migrationService);
        break;

      case 'up':
      case 'migrate':
        await handleMigrate(migrationService);
        break;

      case 'down':
      case 'rollback':
        await handleRollback(migrationService, args[1]);
        break;

      case 'info':
        await migrationService.info();
        break;

      case 'create':
        await handleCreateMigration(migrationService, args.slice(1).join(' '));
        break;

      default:
        console.error(`错误: 未知命令 '${command}'`);
        console.log('运行 npm run migrate 查看帮助');
        process.exit(1);
    }
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

async function handleStatus(migrationService: MigrationService): Promise<void> {
  const status = await migrationService.status();

  console.log('\n=== 迁移状态 ===');
  console.log(`当前版本: V${status.current}`);
  console.log(`待执行迁移: ${status.pending.length}`);
  console.log(`已应用迁移: ${status.applied.length}`);
}

async function handleMigrate(migrationService: MigrationService): Promise<void> {
  console.log('\n=== 数据库迁移 ===');
  const count = await migrationService.migrate();
  console.log(`\n✓ 成功执行 ${count} 个迁移`);
}

async function handleRollback(migrationService: MigrationService, versionArg?: string): Promise<void> {
  if (!versionArg) {
    const status = await migrationService.status();
    const applied = status.applied;
    
    if (applied.length === 0) {
      console.log('没有可回滚的迁移');
      return;
    }

    const latestVersion = applied[applied.length - 1].version;
    const targetVersion = latestVersion - 1;
    
    console.log(`将回滚到版本 ${targetVersion} (当前版本: ${latestVersion})`);
    const confirm = await promptConfirm('确定要继续吗? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('已取消回滚');
      return;
    }

    versionArg = targetVersion.toString();
  }

  const targetVersion = parseInt(versionArg, 10);
  console.log(`\n=== 数据库回滚到版本 ${targetVersion} ===`);
  
  const count = await migrationService.rollback(targetVersion);
  console.log(`\n✓ 成功回滚 ${count} 个迁移`);
}

async function handleCreateMigration(migrationService: MigrationService, description?: string): Promise<void> {
  if (!description) {
    console.error('错误: 请提供迁移描述');
    console.log('用法: npm run migrate create <description>');
    console.log('示例: npm run migrate create add_user_table');
    process.exit(1);
  }

  const { existsSync } = await import('node:fs');
  const { writeFileSync } = await import('node:fs');
  const { join } = await import('node:path');

  const filename = migrationService.generateMigrationName(description);
  const filePath = join(migrationsDir, filename);

  if (existsSync(filePath)) {
    console.error(`错误: 迁移文件已存在: ${filename}`);
    process.exit(1);
  }

  const template = `-- Migration: ${description}
-- Description: ${description}
-- Created: ${new Date().toISOString()}

-- // UP

-- 在这里写你的 UP SQL 语句
-- 例如:
-- CREATE TABLE IF NOT EXISTS example_table (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name TEXT NOT NULL,
--   created_at INTEGER NOT NULL
-- );

-- // DOWN

-- 在这里写你的 DOWN SQL 语句（可选）
-- 例如:
-- DROP TABLE IF EXISTS example_table;
`;

  writeFileSync(filePath, template, 'utf-8');
  console.log(`✓ 已创建迁移文件: ${filePath}`);
  console.log('请编辑文件并添加你的 SQL 语句');
}

function promptConfirm(message: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(message);
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

main();
