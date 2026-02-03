export interface MigrationRecord {
  version: number;
  name: string;
  checksum: string;
  installed_on: string;
  execution_time: number;
  success: boolean;
}

export interface Migration {
  version: number;
  name: string;
  up: string;
  down?: string;
  checksum: string;
}

export interface MigrationOptions {
  migrationsDir: string;
  table?: string;
}
