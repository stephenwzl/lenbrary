import db from '../utils/database';
import type { Asset, ExifData, CreateExifData, VideoMetadata, CreateVideoMetadata } from '../types/assets.types';
import type { ImportResult, LibraryFilters } from '../types/library.types';
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

  getLibraryAssets(filters: LibraryFilters): Asset[] {
    const params: any[] = [];
    const where: string[] = [];
    let sql = `
      SELECT DISTINCT assets.* FROM assets
      LEFT JOIN asset_exif ON asset_exif.asset_id = assets.id
      LEFT JOIN asset_video_metadata ON asset_video_metadata.asset_id = assets.id
      LEFT JOIN asset_favorites ON asset_favorites.asset_id = assets.id
      LEFT JOIN asset_tags ON asset_tags.asset_id = assets.id
    `;

    if (filters.type) {
      where.push('assets.file_type = ?');
      params.push(filters.type);
    }
    if (typeof filters.favorite === 'boolean') {
      where.push('COALESCE(asset_favorites.favorite, 0) = ?');
      params.push(filters.favorite ? 1 : 0);
    }
    if (filters.tag) {
      where.push('asset_tags.tag = ?');
      params.push(filters.tag);
    }
    if (filters.dateFrom) {
      where.push('assets.created_at >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.push('assets.created_at <= ?');
      params.push(filters.dateTo);
    }
    if (filters.camera) {
      where.push('(asset_exif.make LIKE ? OR asset_exif.model LIKE ?)');
      params.push(`%${filters.camera}%`, `%${filters.camera}%`);
    }
    if (typeof filters.hasThumbnail === 'boolean') {
      where.push(filters.hasThumbnail ? 'assets.thumbnail_path IS NOT NULL' : 'assets.thumbnail_path IS NULL');
    }
    if (typeof filters.hasMetadata === 'boolean') {
      where.push(filters.hasMetadata
        ? '(asset_exif.asset_id IS NOT NULL OR asset_video_metadata.asset_id IS NOT NULL)'
        : '(asset_exif.asset_id IS NULL AND asset_video_metadata.asset_id IS NULL)');
    }

    if (where.length > 0) {
      sql += ` WHERE ${where.join(' AND ')}`;
    }

    sql += ' ORDER BY assets.created_at DESC LIMIT ? OFFSET ?';
    params.push(filters.limit, filters.offset);

    const stmt = db.prepare(sql);
    return stmt.all(...params) as Asset[];
  }

  countLibraryAssets(filters: Omit<LibraryFilters, 'limit' | 'offset'>): number {
    const assets = this.getLibraryAssets({ ...filters, limit: Number.MAX_SAFE_INTEGER, offset: 0 });
    return assets.length;
  }

  deleteAsset(id: number): boolean {
    this.deleteLibraryStateForAsset(id);
    const stmt = db.prepare('DELETE FROM assets WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  setFavorite(assetId: number, favorite: boolean): boolean {
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO asset_favorites (asset_id, favorite, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(asset_id) DO UPDATE SET favorite = excluded.favorite, updated_at = excluded.updated_at
    `);
    const result = stmt.run(assetId, favorite ? 1 : 0, now, now);
    return result.changes > 0;
  }

  getFavorite(assetId: number): boolean {
    const stmt = db.prepare('SELECT favorite FROM asset_favorites WHERE asset_id = ?');
    const row = stmt.get(assetId) as { favorite: number } | undefined;
    return row?.favorite === 1;
  }

  replaceTags(assetId: number, tags: string[]): string[] {
    const normalized = [...new Set(tags.map(tag => tag.trim()).filter(Boolean))];
    const now = Date.now();
    const deleteStmt = db.prepare('DELETE FROM asset_tags WHERE asset_id = ?');
    const insertStmt = db.prepare(`
      INSERT INTO asset_tags (asset_id, tag, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `);
    const tx = db.transaction(() => {
      deleteStmt.run(assetId);
      normalized.forEach(tag => insertStmt.run(assetId, tag, now, now));
    });
    tx();
    return normalized;
  }

  getTags(assetId: number): string[] {
    const stmt = db.prepare('SELECT tag FROM asset_tags WHERE asset_id = ? ORDER BY tag ASC');
    return (stmt.all(assetId) as Array<{ tag: string }>).map(row => row.tag);
  }

  deleteLibraryStateForAsset(assetId: number): void {
    db.prepare('DELETE FROM asset_tags WHERE asset_id = ?').run(assetId);
    db.prepare('DELETE FROM asset_favorites WHERE asset_id = ?').run(assetId);
  }

  recordImportEvent(result: ImportResult): void {
    const stmt = db.prepare(`
      INSERT INTO import_events (
        input_name, status, asset_id, message, media_type,
        metadata_available, thumbnail_available, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      result.inputName,
      result.status,
      result.assetId || null,
      result.message,
      result.mediaType || null,
      result.metadataAvailable ? 1 : 0,
      result.thumbnailAvailable ? 1 : 0,
      Date.now(),
    );
  }

  countImportEventsByStatus(status: string): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM import_events WHERE status = ?');
    return (stmt.get(status) as { count: number }).count;
  }

  countAssetsByType(type?: 'image' | 'video'): number {
    const stmt = type
      ? db.prepare('SELECT COUNT(*) as count FROM assets WHERE file_type = ?')
      : db.prepare('SELECT COUNT(*) as count FROM assets');
    const row = type ? stmt.get(type) : stmt.get();
    return (row as { count: number }).count;
  }

  countAssetsMissingMetadata(): number {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM assets
      LEFT JOIN asset_exif ON asset_exif.asset_id = assets.id
      LEFT JOIN asset_video_metadata ON asset_video_metadata.asset_id = assets.id
      WHERE asset_exif.asset_id IS NULL AND asset_video_metadata.asset_id IS NULL
    `);
    return (stmt.get() as { count: number }).count;
  }

  getAllAssetsForExport(): Asset[] {
    const stmt = db.prepare('SELECT * FROM assets ORDER BY created_at DESC');
    return stmt.all() as Asset[];
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
