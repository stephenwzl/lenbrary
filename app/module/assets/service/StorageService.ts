import { SingletonProto, AccessLevel, Inject, type Logger, type Application } from 'egg';
import { mkdirSync, readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';

interface UploadResult {
  storedName: string;
  filePath: string;
  originalPath: string;
}

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class StorageService {
  @Inject()
  private logger: Logger;

  @Inject()
  private app: Application;

  private get uploadDir() {
    return this.app.config.assets.uploadDir;
  }

  private get originalDir() {
    return join(this.uploadDir, 'original');
  }

  private get thumbnailDir() {
    return join(this.uploadDir, 'thumbnails');
  }

  ensureDir() {
    [this.uploadDir, this.originalDir, this.thumbnailDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  uploadFile(file: any): UploadResult {
    this.ensureDir();

    const date = new Date();
    const datePath = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    const dir = join(this.originalDir, datePath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const storedName = `${uuidv4()}${this.getExtension(file.originalname)}`;
    const filePath = join(dir, storedName);

    // 移动文件到目标位置
    const buffer = readFileSync(file.filepath);
    // 注意: Egg 的 multipart 模式会把文件存到临时目录，我们需要把文件 move 过去
    // 这里简化处理，直接把临时文件的内容写入目标路径
    writeFileSync(filePath, buffer);
    this.logger.info('[StorageService] File uploaded: %s', filePath);

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
        this.logger.info('[StorageService] File deleted: %s', filePath);
        return true;
      }
    } catch (error) {
      this.logger.error('[StorageService] Failed to delete file: %s', error);
    }
    return false;
  }

  getThumbnailPath(assetId: number, ext: string): string {
    const date = new Date();
    const datePath = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    const dir = join(this.thumbnailDir, datePath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    return join(dir, `${assetId}${ext}`);
  }

  private getExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  }
}
