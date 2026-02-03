import { mkdirSync, readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { appConfig } from '../config/index';
import logger from '../middleware/logger';

interface UploadResult {
  storedName: string;
  filePath: string;
  originalPath: string;
}

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private get uploadDir(): string {
    return appConfig.upload.dir;
  }

  private get originalDir(): string {
    return join(this.uploadDir, 'original');
  }

  private get thumbnailDir(): string {
    return join(this.uploadDir, 'thumbnails');
  }

  private ensureDir(dir: string): void {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  ensureDirs(): void {
    this.ensureDir(this.uploadDir);
    this.ensureDir(this.originalDir);
    this.ensureDir(this.thumbnailDir);
  }

  uploadFile(file: any): UploadResult {
    this.ensureDirs();

    const date = new Date();
    const datePath = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    const dir = join(this.originalDir, datePath);

    this.ensureDir(dir);

    const storedName = `${uuidv4()}${this.getExtension(file.originalname)}`;
    const filePath = join(dir, storedName);

    const buffer = readFileSync(file.filepath);
    writeFileSync(filePath, buffer);
    logger.info('[StorageService] File uploaded', { filePath });

    return {
      storedName,
      filePath,
      originalPath: file.filepath,
    };
  }

  deleteFile(filePath: string): boolean {
    try {
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        logger.info('[StorageService] File deleted', { filePath });
        return true;
      }
    } catch (error) {
      logger.error('[StorageService] Failed to delete file', { error, filePath });
    }
    return false;
  }

  getThumbnailPath(assetId: number, ext: string): string {
    const date = new Date();
    const datePath = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    const dir = join(this.thumbnailDir, datePath);

    this.ensureDir(dir);

    return join(dir, `${assetId}${ext}`);
  }

  private getExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  }
}

export default StorageService;
