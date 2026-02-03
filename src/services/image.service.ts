import sharp from 'sharp';
import type { CreateExifData } from '../types/assets.types';
import logger from '../middleware/logger';

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

class ImageService {
  private static instance: ImageService;

  private constructor() {}

  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  /**
   * 判断图片格式是否支持处理
   */
  isFormatSupported(mimeType: string, ext?: string): boolean {
    if (!mimeType.startsWith('image/')) {
      return false;
    }

    const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff', 'avif'];

    if (ext && supportedFormats.includes(ext.toLowerCase())) {
      return true;
    }

    return true;
  }

  /**
   * 处理图片：生成缩略图、提取元数据、提取 EXIF
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

    if (!this.isFormatSupported(mimeType, ext)) {
      logger.info('[ImageService] Image format not supported for processing', { mimeType });
      return result;
    }

    try {
      const metadata = await this.getImageMetadata(imagePath);
      result.width = metadata.width;
      result.height = metadata.height;

      await this.generateThumbnail(imagePath, thumbnailPath, size);
      result.thumbnailPath = thumbnailPath;

      const exif = await this.extractExif(imagePath, assetId);
      if (exif) {
        result.exif = exif;
      }

      result.canProcess = true;
      return result;
    } catch (error) {
      logger.warn('[ImageService] Failed to process image', { error });
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
      logger.info('[ImageService] Thumbnail generated', { thumbnailPath });
    } catch (error) {
      logger.error('[ImageService] Failed to generate thumbnail', { error });
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
      logger.error('[ImageService] Failed to get metadata', { error });
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

      try {
        const { orientation, exif: exifBuffer } = metadata;

        const result: ExtractedExifData = {
          orientation: orientation || undefined,
          raw_exif: exifBuffer ? exifBuffer.toString('base64') : undefined,
        };

        const data: CreateExifData = {
          ...result,
          asset_id: assetId,
        };

        return data;
      } catch (parseError) {
        logger.warn('[ImageService] EXIF parse error, using basic data', { error: parseError });
        return {
          asset_id: assetId,
          raw_exif: exifData.toString('base64'),
        };
      }
    } catch (error) {
      logger.error('[ImageService] Failed to extract EXIF', { error });
      return null;
    }
  }
}

export default ImageService;
