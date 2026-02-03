import { SingletonProto, AccessLevel, Inject, type Logger } from 'egg';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Asset, ExifData, CreateExifData } from '../schema/AssetsSchema';

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class DatabaseService {
  @Inject()
  private logger: Logger;

  private db: Database.Database;

  constructor() {
    // 初始化数据库连接
    this.db = new Database('data/assets.db');
    this.db.pragma('journal_mode = WAL');
    this.initTables();
  }

  private initTables() {
    const schemaPath = join(__dirname, '../db/schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    this.db.exec(schema);
    this.logger.info('[DatabaseService] Tables initialized successfully');
  }

  // Asset operations
  createAsset(asset: Omit<Asset, 'id'>): Asset {
    const stmt = this.db.prepare(`
      INSERT INTO assets (
        original_name, stored_name, file_path, thumbnail_path,
        mime_type, file_type, file_size, width, height, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      asset.original_name,
      asset.stored_name,
      asset.file_path,
      asset.thumbnail_path || null,
      asset.mime_type,
      asset.file_type,
      asset.file_size,
      asset.width || null,
      asset.height || null,
      asset.created_at
    );

    const createdAsset = this.getAssetById(result.lastInsertRowid as number);
    if (!createdAsset) {
      throw new Error('Failed to create asset');
    }
    return createdAsset;
  }

  getAssetById(id: number): Asset | undefined {
    const stmt = this.db.prepare('SELECT * FROM assets WHERE id = ?');
    return stmt.get(id) as Asset | undefined;
  }

  getAssets(limit: number = 20, offset: number = 0, type?: string): Asset[] {
    let sql = 'SELECT * FROM assets';
    const params: any[] = [];

    if (type) {
      sql += ' WHERE file_type = ?';
      params.push(type);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as Asset[];
  }

  deleteAsset(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM assets WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Exif operations
  createExif(exif: CreateExifData): ExifData {
    const stmt = this.db.prepare(`
      INSERT INTO asset_exif (
        asset_id, make, model, datetime, exposure_time, f_number,
        iso, focal_length, lens_make, lens_model, orientation,
        gps_latitude, gps_longitude, software, color_space, raw_exif
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      exif.asset_id,
      exif.make || null,
      exif.model || null,
      exif.datetime || null,
      exif.exposure_time || null,
      exif.f_number || null,
      exif.iso || null,
      exif.focal_length || null,
      exif.lens_make || null,
      exif.lens_model || null,
      exif.orientation || null,
      exif.gps_latitude || null,
      exif.gps_longitude || null,
      exif.software || null,
      exif.color_space || null,
      exif.raw_exif || null
    );

    const createdExif = this.getExifByAssetId(exif.asset_id);
    if (!createdExif) {
      throw new Error('Failed to create EXIF');
    }
    return createdExif;
  }

  getExifByAssetId(assetId: number): ExifData | undefined {
    const stmt = this.db.prepare('SELECT * FROM asset_exif WHERE asset_id = ?');
    return stmt.get(assetId) as ExifData | undefined;
  }

  updateExif(assetId: number, exif: Partial<CreateExifData>): boolean {
    const fields: string[] = [];
    const params: any[] = [];

    Object.entries(exif).forEach(([key, value]) => {
      if (key !== 'asset_id') {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    });

    params.push(assetId);

    if (fields.length === 0) return false;

    const sql = `UPDATE asset_exif SET ${fields.join(', ')} WHERE asset_id = ?`;
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...params);
    return result.changes > 0;
  }

  deleteExif(assetId: number): boolean {
    const stmt = this.db.prepare('DELETE FROM asset_exif WHERE asset_id = ?');
    const result = stmt.run(assetId);
    return result.changes > 0;
  }

  close() {
    this.db.close();
  }
}
