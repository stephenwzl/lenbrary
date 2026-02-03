import { SingletonProto, AccessLevel, Inject, type Logger } from 'egg';
import sharp from 'sharp';
import type { CreateExifData } from '../schema/AssetsSchema';

interface ExtractedExifData {
  make?: string;
  model?: string;
  datetime?: string;
  exposure_time?: string;
  f_number?: number;
  iso?: number;
  focal_length?: number;
  lens_make?: string;
  lens_model?: string;
  orientation?: number;
  gps_latitude?: number;
  gps_longitude?: number;
  software?: string;
  color_space?: string;
  raw_exif?: string;
}

export interface ImageProcessResult {
  canProcess: boolean;
  width?: number;
  height?: number;
  thumbnailPath?: string;
  exif?: CreateExifData;
}

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class ImageService {
  @Inject()
  private logger: Logger;

  /**
   * 判断图片格式是否支持处理
   * 可在此方法中扩展支持更多格式
   */
  isFormatSupported(mimeType: string, ext?: string): boolean {
    if (!mimeType.startsWith('image/')) {
      return false;
    }

    // Sharp 支持的主要图片格式
    // 可以在未来扩展：HEIC 需要 sharp-heic, RAW 相关的需要 sharp-raw 等
    const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff', 'avif'];

    if (ext && supportedFormats.includes(ext.toLowerCase())) {
      return true;
    }

    // 如果没有扩展名信息，也尝试通过文件头检测（在 processImage 中实现）
    return true;
  }

  /**
   * 处理图片：生成缩略图、提取元数据、提取 EXIF
   * 这是一个统一的方法，后续可以轻松扩展支持更多格式
   */
  async processImage(
    imagePath: string,
    mimeType: string,
    ext: string | undefined,
    thumbnailPath: string,
    size: number,
    assetId: number,
  ): Promise<ImageProcessResult> {
    const result: ImageProcessResult = {
      canProcess: false,
    };

    // 检查是否支持该格式
    if (!this.isFormatSupported(mimeType, ext)) {
      this.logger.info('[ImageService] Image format not supported for processing: %s', mimeType);
      return result;
    }

    try {
      // 获取图片尺寸
      const metadata = await this.getImageMetadata(imagePath);
      result.width = metadata.width;
      result.height = metadata.height;

      // 生成缩略图
      await this.generateThumbnail(imagePath, thumbnailPath, size);
      result.thumbnailPath = thumbnailPath;

      // 提取 EXIF
      const exif = await this.extractExif(imagePath, assetId);
      if (exif) {
        result.exif = exif;
      }

      result.canProcess = true;
      return result;
    } catch (error) {
      this.logger.warn('[ImageService] Failed to process image: %s', error);
      // 即使处理失败，也返回已处理的信息（如尺寸等）
      return result;
    }
  }

  async generateThumbnail(imagePath: string, thumbnailPath: string, size: number = 300): Promise<void> {
    try {
      await sharp(imagePath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 85 })
        .toFile(thumbnailPath);
      this.logger.info('[ImageService] Thumbnail generated: %s', thumbnailPath);
    } catch (error) {
      this.logger.error('[ImageService] Failed to generate thumbnail: %s', error);
      throw error;
    }
  }

  async getImageMetadata(imagePath: string): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(imagePath).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      this.logger.error('[ImageService] Failed to get metadata: %s', error);
      throw error;
    }
  }

  async extractExif(imagePath: string, assetId: number): Promise<CreateExifData | null> {
    try {
      const metadata = await sharp(imagePath).metadata();
      const exifData = metadata.exif;

      if (!exifData) {
        return null;
      }

      // 解析 EXIF 数据
      try {
        // Sharp 的 exif 是 Buffer，需要解析
        // 这里我们使用 sharp 的内置功能来提取常用 EXIF 字段
        const { orientation, exif: exifBuffer } = metadata;

        // 提取基础 EXIF 字段
        const result: ExtractedExifData = {
          orientation: orientation || undefined,
          // 将完整 EXIF 数据存储为 base64 字符串
          raw_exif: exifBuffer ? exifBuffer.toString('base64') : undefined,
        };

        // 尝试从 metadata 中提取更多信息
        // 注意: 这部分需要更复杂的 EXIF 解析库，如 exif-reader
        // 为了 MVP 简洁实现，这里只保存 raw_exif 和 orientation
        // 在后续版本中可以集成更专业的 EXIF 解析库
        const data: CreateExifData = {
          ...result,
          asset_id: assetId,
        };

        return data;
      } catch (parseError) {
        this.logger.warn('[ImageService] EXIF parse error, using basic data: %s', parseError);
        return {
          asset_id: assetId,
          raw_exif: exifData.toString('base64'),
        };
      }
    } catch (error) {
      this.logger.error('[ImageService] Failed to extract EXIF: %s', error);
      return null;
    }
  }
}
