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
      // 首先使用 sharp 获取图片元数据（包含原始 EXIF buffer）
      const metadata = await sharp(imagePath).metadata();
      const exifBuffer = metadata.exif;

      if (!exifBuffer) {
        logger.info('[ImageService] No EXIF data found in image', { imagePath });
        return null;
      }

      logger.debug('[ImageService] EXIF buffer found', { 
        imagePath,
        exifSize: exifBuffer.length
      });

      // 动态导入 exif-reader（CommonJS 模块）
      const exifModule = await import('exif-reader');
      const exifReader = (exifModule as any).default || exifModule;
      
      // 使用 exif-reader 解析 extracted EXIF buffer
      const tags = exifReader(exifBuffer);
      
      logger.debug('[ImageService] EXIF tags loaded', { 
        hasTags: !!tags,
        hasImage: !!tags.Image,
        hasPhoto: !!tags.Photo,
        hasGPSInfo: !!tags.GPSInfo,
        imagePath
      });

      // 输出调试信息，看看实际有哪些字段
      if (tags.Image) {
        logger.debug('[ImageService] Image IFD fields', {
          Make: tags.Image.Make,
          Model: tags.Image.Model,
          Software: tags.Image.Software,
          DateTime: tags.Image.DateTime,
          allKeys: Object.keys(tags.Image)
        });
      }

      if (tags.Photo) {
        logger.debug('[ImageService] Photo IFD fields', {
          DateTimeOriginal: tags.Photo.DateTimeOriginal,
          ExposureTime: tags.Photo.ExposureTime,
          FNumber: tags.Photo.FNumber,
          ISOSpeedRatings: tags.Photo.ISOSpeedRatings,
          FocalLength: tags.Photo.FocalLength,
          Make: tags.Photo.Make,
          Model: tags.Photo.Model,
          allKeys: Object.keys(tags.Photo)
        });
      }

      const result: ExtractedExifData = {};

      // 先从 Photo IFD 解析拍摄参数（优先级更高）
      if (tags.Photo) {
        // 拍摄时间
        if (tags.Photo.DateTimeOriginal) {
          result.datetime = this.formatDate(tags.Photo.DateTimeOriginal);
        }

        // 曝光时间
        if (tags.Photo.ExposureTime) {
          result.exposure_time = this.formatExposureTime(tags.Photo.ExposureTime);
        }

        // 光圈值
        result.f_number = tags.Photo.FNumber;

        // ISO 感光度
        result.iso = tags.Photo.ISOSpeedRatings;

        // 焦距（毫米）
        result.focal_length = tags.Photo.FocalLength;

        // 颜色空间
        if (tags.Photo.ColorSpace !== undefined) {
          result.color_space = this.formatColorSpace(tags.Photo.ColorSpace);
        }

        // 相机信息（可能在 Photo IFD 中）
        result.make = this.cleanString(tags.Photo.Make);
        result.model = this.cleanString(tags.Photo.Model);

        // 镜头信息
        result.lens_make = this.cleanString(tags.Photo.LensMake);
        result.lens_model = this.cleanString(tags.Photo.LensModel);
      }

      // 再从 Image IFD 解析基本信息（如果 Photo 中没有）
      if (tags.Image) {
        // 相机信息（如果 Photo IFD 中没有）
        if (!result.make) {
          result.make = this.cleanString(tags.Image.Make);
        }
        if (!result.model) {
          result.model = this.cleanString(tags.Image.Model);
        }

        // 软件信息
        result.software = this.cleanString(tags.Image.Software);

        // 拍摄时间（优先使用 Photo 的 DateTimeOriginal，如果没有才用 Image 的 DateTime）
        if (!result.datetime) {
          result.datetime = this.formatDate(tags.Image.DateTime);
        }

        // 方向信息
        if (tags.Image.Orientation) {
          result.orientation = tags.Image.Orientation;
        }
      }

      // 从 GPSInfo IFD 解析位置信息
      if (tags.GPSInfo) {
        // GPS 经纬度转换为十进制
        if (tags.GPSInfo.GPSLatitude && tags.GPSInfo.GPSLatitudeRef) {
          const lat = this.convertDMSToDD(
            tags.GPSInfo.GPSLatitude,
            tags.GPSInfo.GPSLatitudeRef
          );
          result.gps_latitude = lat;
        }

        if (tags.GPSInfo.GPSLongitude && tags.GPSInfo.GPSLongitudeRef) {
          const lon = this.convertDMSToDD(
            tags.GPSInfo.GPSLongitude,
            tags.GPSInfo.GPSLongitudeRef
          );
          result.gps_longitude = lon;
        }
      }

      // 如果没有提取到任何有用数据，返回 null
      const hasData = Object.values(result).some(
        (value) => value !== undefined && value !== null && value !== ''
      );

      if (!hasData) {
        logger.info('[ImageService] No EXIF data found after parsing', { imagePath });
        return null;
      }

      logger.info('[ImageService] EXIF data extracted successfully', {
        make: result.make,
        model: result.model,
        datetime: result.datetime,
        hasGps: !!result.gps_latitude,
      });

      const data: CreateExifData = {
        ...result,
        asset_id: assetId,
      };

      return data;
    } catch (error) {
      logger.error('[ImageService] Failed to extract EXIF', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : error,
        imagePath,
        errorString: String(error),
      });
      return null;
    }
  }

  /**
   * 清理字符串中的 null 字符和空白
   */
  private cleanString(value: string | undefined): string | undefined {
    if (!value) return undefined;
    // 移除末尾的 null 字符和空白
    return value.replace(/[\u0000\s]+$/g, '').trim() || undefined;
  }

  /**
   * 格式化颜色空间代码为可读字符串
   */
  private formatColorSpace(colorSpace: number | undefined): string | undefined {
    if (colorSpace === undefined || colorSpace === null) return undefined;

    const colorSpaceMap: Record<number, string> = {
      1: 'sRGB',
      2: 'Adobe RGB',
      65533: 'Wide Gamut RGB',
      65534: 'ICC Profile',
      65535: 'Uncalibrated',
    };

    return colorSpaceMap[colorSpace] || `Unknown (${colorSpace})`;
  }

  /**
   * 格式化日期对象为字符串
   */
  private formatDate(date: Date | string | undefined): string | undefined {
    if (!date) {
      return undefined;
    }
    
    if (typeof date === 'string') {
      return this.cleanString(date);
    }
    
    return date.toISOString();
  }

  /**
   * 格式化曝光时间为可读字符串
   */
  private formatExposureTime(exposureTime: number): string {
    // 如果是整数且小于 1，表示是分数（如 0.008 = 1/125）
    if (exposureTime < 1) {
      const reciprocal = Math.round(1 / exposureTime);
      return `1/${reciprocal}`;
    }
    
    // 否则直接返回数值
    return exposureTime.toString();
  }

  /**
   * 将 GPS 度分秒格式转换为十进制格式
   * @param dms - 度分秒数组 [degrees, minutes, seconds]
   * @param ref - 方向引用 ('N'/'S' 或 'E'/'W')
   * @returns 十进制坐标
   */
  private convertDMSToDD(dms: number[], ref: string): number {
    const degrees = dms[0];
    const minutes = dms[1];
    const seconds = dms[2];

    let dd = degrees + minutes / 60 + seconds / (60 * 60);

    // 根据方向调整符号
    if (ref === 'S' || ref === 'W') {
      dd = dd * -1;
    }

    return dd;
  }
}

export default ImageService;
