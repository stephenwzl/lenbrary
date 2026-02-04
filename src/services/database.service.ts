import db from '../utils/database';
import type { Asset, ExifData, CreateExifData, VideoMetadata, CreateVideoMetadata } from '../types/assets.types';
// import logger from '../middleware/logger';

class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Asset operations
  createAsset(asset: Omit<Asset, 'id'>): Asset {
    const stmt = db.prepare(`
      INSERT INTO assets (
        original_name, stored_name, file_path, thumbnail_path,
        mime_type, file_type, file_size, width, height, file_hash, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      asset.file_hash || null,
      asset.created_at
    );

    const createdAsset = this.getAssetById(result.lastInsertRowid as number);
    if (!createdAsset) {
      throw new Error('Failed to create asset');
    }
    return createdAsset;
  }

  getAssetById(id: number): Asset | undefined {
    const stmt = db.prepare('SELECT * FROM assets WHERE id = ?');
    return stmt.get(id) as Asset | undefined;
  }

  getAssetByHash(hash: string): Asset | undefined {
    const stmt = db.prepare('SELECT * FROM assets WHERE file_hash = ?');
    return stmt.get(hash) as Asset | undefined;
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

    const stmt = db.prepare(sql);
    return stmt.all(...params) as Asset[];
  }

  deleteAsset(id: number): boolean {
    const stmt = db.prepare('DELETE FROM assets WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Exif operations
  createExif(exif: CreateExifData): ExifData {
    try {
      // 使用更简洁的方式插入数据
      const columns = Object.keys(exif).filter(key => key !== 'id');
      const placeholders = columns.map(() => '?').join(', ');
      const values = columns.map(col => {
        const val = (exif as any)[col];
        return val !== undefined && val !== null && val !== '' ? val : null;
      });

      const sql = `INSERT INTO asset_exif (${columns.join(', ')}) VALUES (${placeholders})`;
      
      const stmt = db.prepare(sql);
      stmt.run(...values);

      const createdExif = this.getExifByAssetId(exif.asset_id);
      if (!createdExif) {
        throw new Error('Failed to create EXIF');
      }
      return createdExif;
    } catch (error) {
      const err = error as any;
      console.error('[DatabaseService] createExif error details:', {
        message: err.message,
        code: err.code,
        assetId: exif.asset_id,
        sampleFields: {
          make: exif.make,
          model: exif.model,
          datetime: exif.datetime,
          exif_version: exif.exif_version,
          serial_number: exif.serial_number,
        }
      });
      throw err;
    }
  }

  getExifByAssetId(assetId: number): ExifData | undefined {
    const stmt = db.prepare('SELECT * FROM asset_exif WHERE asset_id = ?');
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
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return result.changes > 0;
  }

  deleteExif(assetId: number): boolean {
    const stmt = db.prepare('DELETE FROM asset_exif WHERE asset_id = ?');
    const result = stmt.run(assetId);
    return result.changes > 0;
  }

  // Video Metadata operations
  createVideoMetadata(videoMetadata: CreateVideoMetadata): VideoMetadata {
    try {
      const columns = Object.keys(videoMetadata).filter(key => key !== 'id');
      const placeholders = columns.map(() => '?').join(', ');
      const values = columns.map(col => {
        const val = (videoMetadata as any)[col];
        return val !== undefined && val !== null && val !== '' ? val : null;
      });

      const sql = `INSERT INTO asset_video_metadata (${columns.join(', ')}) VALUES (${placeholders})`;

      const stmt = db.prepare(sql);
      stmt.run(...values);

      const createdMetadata = this.getVideoMetadataByAssetId(videoMetadata.asset_id);
      if (!createdMetadata) {
        throw new Error('Failed to create video metadata');
      }
      return createdMetadata;
    } catch (error) {
      const err = error as any;
      console.error('[DatabaseService] createVideoMetadata error details:', {
        message: err.message,
        code: err.code,
        assetId: videoMetadata.asset_id,
        sampleFields: {
          duration: videoMetadata.duration,
          video_codec: videoMetadata.video_codec,
          is_hdr: videoMetadata.is_hdr,
          hdr_format: videoMetadata.hdr_format,
        }
      });
      throw err;
    }
  }

  getVideoMetadataByAssetId(assetId: number): VideoMetadata | undefined {
    const stmt = db.prepare('SELECT * FROM asset_video_metadata WHERE asset_id = ?');
    return stmt.get(assetId) as VideoMetadata | undefined;
  }

  updateVideoMetadata(assetId: number, videoMetadata: Partial<CreateVideoMetadata>): boolean {
    const fields: string[] = [];
    const params: any[] = [];

    Object.entries(videoMetadata).forEach(([key, value]) => {
      if (key !== 'asset_id') {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    });

    params.push(assetId);

    if (fields.length === 0) return false;

    const sql = `UPDATE asset_video_metadata SET ${fields.join(', ')} WHERE asset_id = ?`;
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return result.changes > 0;
  }

  deleteVideoMetadata(assetId: number): boolean {
    const stmt = db.prepare('DELETE FROM asset_video_metadata WHERE asset_id = ?');
    const result = stmt.run(assetId);
    return result.changes > 0;
  }

  close(): void {
    db.close();
  }
}

export default DatabaseService;
