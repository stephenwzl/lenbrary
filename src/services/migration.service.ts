import Database from 'better-sqlite3';
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { createHash } from 'node:crypto';
import type { Migration, MigrationRecord, MigrationOptions } from '../types/migrations.types';

export class MigrationService {
  private db: Database.Database;
  private migrationsDir: string;
  private tableName: string;

  constructor(db: Database.Database, options: MigrationOptions) {
    this.db = db;
    this.migrationsDir = options.migrationsDir;
    this.tableName = options.table || '__schema_migrations__';
    this.initializeMigrationTable();
  }

  private initializeMigrationTable(): void {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        checksum TEXT NOT NULL,
        installed_on TEXT NOT NULL,
        execution_time INTEGER NOT NULL,
        success INTEGER NOT NULL
      )
    `;
    this.db.exec(createTableSQL);
  }

  private getChecksum(content: string): string {
    return createHash('md5').update(content).digest('hex');
  }

  private parseVersionNumber(filename: string): number {
    const match = filename.match(/^V(\d+)__/);
    if (!match) {
      throw new Error(`Invalid migration file name: ${filename}. Expected format: V{number}__{description}.sql`);
    }
    return parseInt(match[1], 10);
  }

  private parseMigrationFile(content: string): { up: string; down?: string } {
    const lines = content.split('\n');
    let upLines: string[] = [];
    let downLines: string[] = [];
    let currentSection: 'up' | 'down' | null = null;

    for (const line of lines) {
      if (line.trim().startsWith('-- // UP')) {
        currentSection = 'up';
        continue;
      }
      if (line.trim().startsWith('-- // DOWN')) {
        currentSection = 'down';
        continue;
      }
      if (line.trim().startsWith('--')) continue;

      if (currentSection === 'up') {
        upLines.push(line);
      } else if (currentSection === 'down') {
        downLines.push(line);
      }
    }

    return {
      up: upLines.join('\n').trim(),
      down: downLines.join('\n').trim() || undefined,
    };
  }

  private loadMigrations(): Migration[] {
    const files = readdirSync(this.migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => this.parseVersionNumber(a) - this.parseVersionNumber(b));

    const migrations: Migration[] = [];

    for (const file of files) {
      const filePath = join(this.migrationsDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const version = this.parseVersionNumber(file);
      const description = basename(file, '.sql').replace(/^V\d+__/, '').replace(/_/g, ' ');
      const { up, down } = this.parseMigrationFile(content);
      const checksum = this.getChecksum(up);

      migrations.push({
        version,
        name: description,
        up,
        down,
        checksum,
      });
    }

    return migrations;
  }

  private getAppliedMigrations(): MigrationRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM ${this.tableName}
      WHERE success = 1
      ORDER BY version ASC
    `);
    return stmt.all() as MigrationRecord[];
  }

  private recordMigration(
    version: number,
    name: string,
    checksum: string,
    executionTime: number,
    success: boolean
  ): void {
    const stmt = this.db.prepare(`
      INSERT INTO ${this.tableName} (version, name, checksum, installed_on, execution_time, success)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(version, name, checksum, new Date().toISOString(), executionTime, success ? 1 : 0);
  }

  private executeSQL(sql: string): void {
    if (!sql.trim()) return;

    // Split SQL statements by semicolon and execute each one
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        this.db.exec(statement);
      } catch (error) {
        console.error(`Error executing: ${statement.substring(0, 100)}...`);
        throw error;
      }
    }
  }

  public async status(): Promise<{
    current: number;
    pending: Migration[];
    applied: MigrationRecord[];
  }> {
    const migrations = this.loadMigrations();
    const applied = this.getAppliedMigrations();
    const currentVersion = applied.length > 0 ? applied[applied.length - 1].version : 0;
    const pending = migrations.filter((m) => m.version > currentVersion);

    return {
      current: currentVersion,
      pending,
      applied,
    };
  }

  public async migrate(): Promise<number> {
    const migrations = this.loadMigrations();
    const applied = this.getAppliedMigrations();
    const appliedVersions = new Set(applied.map((r) => r.version));

    const pendingMigrations = migrations.filter((m) => !appliedVersions.has(m.version));

    if (pendingMigrations.length === 0) {
      console.log('✓ 数据库已是最新版本，无需迁移');
      return 0;
    }

    console.log(`发现 ${pendingMigrations.length} 个待执行的迁移:`);
    pendingMigrations.forEach((m) => {
      console.log(`  V${m.version}__${m.name}`);
    });

    let successCount = 0;

    for (const migration of pendingMigrations) {
      const startTime = Date.now();
      console.log(`\n正在执行迁移 V${migration.version}__${migration.name}...`);

      // 开始事务
      const transaction = this.db.transaction(() => {
        try {
          this.executeSQL(migration.up);
          const executionTime = Date.now() - startTime;
          this.recordMigration(migration.version, migration.name, migration.checksum, executionTime, true);
          console.log(`✓ 迁移 V${migration.version} 完成 (耗时 ${executionTime}ms)`);
          successCount++;
        } catch (error) {
          const executionTime = Date.now() - startTime;
          this.recordMigration(migration.version, migration.name, migration.checksum, executionTime, false);
          throw error;
        }
      });

      try {
        transaction();
      } catch (error) {
        console.error(`✕ 迁移 V${migration.version} 失败:`, error);
        throw error;
      }
    }

    return successCount;
  }

  public async rollback(targetVersion: number): Promise<number> {
    const applied = this.getAppliedMigrations();
    const migrations = this.loadMigrations();

    // 获取需要回滚的迁移（从最新到目标版本）
    const toRollback = applied
      .filter((r) => r.version > targetVersion)
      .sort((a, b) => b.version - a.version);

    if (toRollback.length === 0) {
      console.log('✓ 无需回滚');
      return 0;
    }

    console.log(`准备回滚 ${toRollback.length} 个迁移:`);
    toRollback.forEach((r) => {
      console.log(`  V${r.version}__${r.name}`);
    });

    let rolledBackCount = 0;

    for (const record of toRollback) {
      const migration = migrations.find((m) => m.version === record.version);
      if (!migration) {
        console.error(`✕ 未找到迁移文件 V${record.version}`);
        continue;
      }

      if (!migration.down) {
        console.error(`✕ 迁移 V${record.version} 不支持回滚`);
        continue;
      }

      const startTime = Date.now();
      console.log(`\n正在回滚迁移 V${migration.version}__${migration.name}...`);

      const transaction = this.db.transaction(() => {
        try {
          this.executeSQL(migration.down!);
          const executionTime = Date.now() - startTime;
          // 删除迁移记录
          this.db.prepare(`DELETE FROM ${this.tableName} WHERE version = ?`).run(record.version);
          console.log(`✓ 回滚 V${migration.version} 完成 (耗时 ${executionTime}ms)`);
          rolledBackCount++;
        } catch (error) {
          console.error(`✕ 回滚 V${migration.version} 失败:`, error);
          throw error;
        }
      });

      try {
        transaction();
      } catch (error) {
        console.error(`回滚失败:`, error);
        throw error;
      }
    }

    return rolledBackCount;
  }

  public async info(): Promise<void> {
    const { current, pending, applied } = await this.status();

    console.log('\n=== 数据库迁移状态 ===');
    console.log(`当前版本: V${current}`);
    console.log(`已应用迁移数: ${applied.length}`);
    console.log(`待执行迁移数: ${pending.length}`);

    if (applied.length > 0) {
      console.log('\n已应用的迁移:');
      applied.forEach((record) => {
        const success = record.success ? '✓' : '✕';
        console.log(`  ${success} V${record.version}__${record.name}`);
        console.log(`     安装时间: ${record.installed_on}`);
        console.log(`     执行耗时: ${record.execution_time}ms`);
      });
    }

    if (pending.length > 0) {
      console.log('\n待执行的迁移:');
      pending.forEach((migration) => {
        console.log(`  ↑ V${migration.version}__${migration.name}`);
      });
    }
  }

  public generateMigrationName(description: string): string {
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/[-:.]/g, '')
      .replace('T', '')
      .slice(0, 14);
    
    return `V${timestamp}__${description.replace(/\s+/g, '_').toLowerCase()}.sql`;
  }
}
