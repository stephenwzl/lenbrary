import sharp from 'sharp';
import { ExifTool } from 'exiftool-vendored';
import type { CreateExifData } from '../types/assets.types';
import logger from '../middleware/logger';

// ExifTool 单例类
class ExifToolManager {
  private static instance: ExifToolManager;
  private exiftool: ExifTool | null = null;

  private constructor() {
    this.exiftool = new ExifTool();
  }

  static getInstance(): ExifTool {
    if (!ExifToolManager.instance) {
      ExifToolManager.instance = new ExifToolManager();
    }
    return ExifToolManager.instance.exiftool!;
  }

  static async close(): Promise<void> {
    if (ExifToolManager.instance?.exiftool) {
      await ExifToolManager.instance.exiftool.end();
      ExifToolManager.instance.exiftool = null;
    }
  }
}

interface ExtractedExifData {
  // === 基础图像信息 ===
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

  // === 文件信息 ===
  artist?: string;
  copyright?: string;
  image_width?: number;
  image_height?: number;
  x_resolution?: number;
  y_resolution?: number;
  resolution_unit?: string;
  orientation_text?: string;
  compressed_bits_per_pixel?: number;
  thumbnail_offset?: number;
  thumbnail_length?: number;

  // === 拍摄参数 ===
  exposure_program?: string;
  exposure_compensation?: number;
  exposure_mode?: string;
  metering_mode?: string;
  light_source?: string;
  flash?: string;
  subject_distance?: number;
  max_aperture_value?: number;

  // === 相机设置 ===
  white_balance?: string;
  saturation?: number;
  contrast?: string;
  sharpness?: string;
  scene_capture_type?: string;
  custom_rendered?: string;
  sensing_method?: string;

  // === 日期时间 ===
  date_time_original?: string;
  date_time_digitized?: string;
  offset_time?: string;
  offset_time_original?: string;
  offset_time_digitized?: string;

  // === 镜头信息 ===
  lens_info?: string;
  focal_length_in_35mm_film?: number;
  min_focal_length?: number;
  max_focal_length?: number;
  max_aperture_at_min_focal?: number;
  max_aperture_at_max_focal?: number;
  lens_id?: string;
  circle_of_confusion?: string;

  // === 图像生成 ===
  file_source?: string;
  scene_type?: string;

  // === 图像质量和处理 ===
  quality?: string;
  image_generation?: string;
  image_count?: number;
  exposure_count?: number;

  // === Film Mode (胶片模式) ===
  film_mode?: string;
  dynamic_range?: string;
  dynamic_range_setting?: string;
  auto_dynamic_range?: string;
  shadow_tone?: number;
  highlight_tone?: number;

  // === 图像效果 ===
  lens_modulation_optimizer?: string;
  grain_effect?: string;
  color_chrome_effect?: string;
  color_chrome_fx_blue?: string;

  // === 拍摄模式 ===
  shutter_type?: string;
  auto_bracketing?: string;
  sequence_number?: number;
  drive_mode?: string;
  drive_speed?: string;
  crop_mode?: string;

  // === 警告信息 ===
  blur_warning?: string;
  focus_warning?: string;
  exposure_warning?: string;

  // === 闪光灯和脸部检测 ===
  flicker_reduction?: string;
  faces_detected?: number;
  num_face_elements?: number;

  // === 元数据版本 ===
  exif_version?: string;
  flashpix_version?: string;
  components_configuration?: string;
  subject_distance_range?: string;
  scene_capture?: string;

  // === 标识信息 ===
  serial_number?: string;
  internal_serial_number?: string;
  interoperability_index?: string;
  body_serial_number?: string;

  // === 图像稳定 ===
  image_stabilization?: string;

  // === 其他 ===
  user_comment?: string;
  rating?: number;

  // === 识别 ===
  face_index?: number;
  face_detected?: number;
  recognized_face_count?: number;

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

  isFormatSupported(mimeType: string, ext?: string): boolean {
    if (!mimeType.startsWith('image/')) return false;
    const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff', 'avif'];
    if (ext && supportedFormats.includes(ext.toLowerCase())) {
      return true;
    }
    return true;
  }

  async processImage(
    imagePath: string,
    mimeType: string,
    ext: string | undefined,
    thumbnailPath: string,
    size: number,
    assetId: number,
  ): Promise<ImageProcessResult> {
    const result: ImageProcessResult = { canProcess: false };

    if (!this.isFormatSupported(mimeType, ext)) {
      logger.info('[ImageService] Image format not supported', { mimeType });
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
        .resize(size, size, { fit: 'inside', withoutEnlargement: false })
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

  /**
   * 使用 exiftool 提取 EXIF 数据
   */
  async extractExif(imagePath: string, assetId: number): Promise<CreateExifData | null> {
    try {
      const exiftoolInstance = ExifToolManager.getInstance();
      const tags = await exiftoolInstance.read(imagePath);

      logger.debug('[ImageService] ExifTool tags loaded', {
        imagePath,
        tagCount: Object.keys(tags).length,
        sampleTags: {
          Make: tags.Make,
          FujiModel: tags.FujiModel,
          FilmMode: tags.FilmMode,
          SerialNumber: tags.SerialNumber,
        }
      });

      const result: ExtractedExifData = this.parseExifToolTags(tags);

      const hasData = Object.values(result).some(
        (value) => value !== undefined && value !== null && value !== ''
      );

      if (!hasData) {
        logger.info('[ImageService] No EXIF data found', { imagePath });
        return null;
      }

      logger.info('[ImageService] EXIF data extracted', {
        make: result.make,
        model: result.model,
        filmMode: result.film_mode,
        serialNumber: result.serial_number,
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
      });
      return null;
    }
  }

  /**
   * 解析 exiftool 返回的标签
   */
  private parseExifToolTags(tags: any): ExtractedExifData {
    const result: ExtractedExifData = {};

    // 基础设备信息
    result.make = this.cleanStringValue(tags.Make || tags.FujiModel);
    result.model = this.cleanStringValue(tags.Model || this.extractModelFrom(tags.FujiModel));
    result.software = this.cleanStringValue(tags.Software);
    result.artist = this.cleanStringValue(tags.Artist);
    result.copyright = this.cleanStringValue(tags.Copyright);

    // 序列号
    result.serial_number = this.cleanStringValue(tags.SerialNumber);
    result.internal_serial_number = this.cleanStringValue(tags.InternalSerialNumber);
    result.body_serial_number = this.cleanStringValue(tags.BodySerialNumber);

    // 日期时间
    result.datetime = this.cleanStringValue(tags.DateTimeOriginal || tags.CreateDate || tags.DateTime);
    result.date_time_original = this.cleanStringValue(tags.DateTimeOriginal);
    result.date_time_digitized = this.cleanStringValue(tags.DateTimeDigitized);
    result.offset_time = this.cleanStringValue(tags.OffsetTime);
    result.offset_time_original = this.cleanStringValue(tags.OffsetTimeOriginal);
    result.offset_time_digitized = this.cleanStringValue(tags.OffsetTimeDigitized);

    // 图像尺寸
    result.image_width = this.parseNumber(tags.ImageWidth || tags.ExifImageWidth);
    result.image_height = this.parseNumber(tags.ImageHeight || tags.ExifImageHeight);
    result.orientation = this.parseNumber(tags.Orientation);
    result.orientation_text = this.formatOrientation(tags.Orientation);

    // 分辨率
    result.x_resolution = this.parseNumber(tags.XResolution);
    result.y_resolution = this.parseNumber(tags.YResolution);
    result.resolution_unit = this.formatResolutionUnit(tags.ResolutionUnit);
    result.compressed_bits_per_pixel = this.parseNumber(tags.CompressedBitsPerPixel);

    // 缩略图
    result.thumbnail_offset = this.parseNumber(tags.ThumbnailOffset || tags.JPEGInterchangeFormat);
    result.thumbnail_length = this.parseNumber(tags.ThumbnailLength || tags.JPEGInterchangeFormatLength);

    // 拍摄参数
    result.exposure_time = this.formatExposureTime(tags.ExposureTime || tags.ShutterSpeedValue);
    result.f_number = this.parseNumber(tags.FNumber);
    result.iso = this.parseNumber(tags.ISO || tags.ISOSpeedRatings);
    result.focal_length = this.parseNumber(tags.FocalLength);

    // 曝光程序和模式
    result.exposure_program = this.formatExposureProgram(tags.ExposureProgram);
    result.exposure_compensation = this.parseNumber(tags.ExposureCompensation || tags.ExposureBiasValue);
    result.exposure_mode = this.formatExposureMode(tags.ExposureMode);
    result.metering_mode = this.formatMeteringMode(tags.MeteringMode);
    result.light_source = this.formatLightSource(tags.LightSource);
    result.flash = this.formatFlash(tags.Flash || tags.Fired);

    // 镜头信息
    result.lens_make = this.cleanStringValue(tags.LensMake);
    result.lens_model = this.cleanStringValue(tags.LensModel);
    result.lens_id = this.cleanStringValue(tags.LensID);
    result.lens_info = this.cleanStringValue(tags.LensInfo || tags.LensSpecification);
    result.focal_length_in_35mm_film = this.parseNumber(tags.FocalLengthIn35mmFormat);

    // 镜头参数
    result.min_focal_length = this.parseNumber(tags.MinFocalLength);
    result.max_focal_length = this.parseNumber(tags.MaxFocalLength);
    result.max_aperture_at_min_focal = this.parseNumber(tags.MinApertureAtMinFocal);
    result.max_aperture_at_max_focal = this.parseNumber(tags.MaxApertureAtMaxFocal);
    result.circle_of_confusion = this.cleanStringValue(tags.CircleOfConfusion);
    result.subject_distance = this.parseNumber(tags.SubjectDistance);
    result.max_aperture_value = this.parseNumber(tags.MaxApertureValue);

    // 相机设置
    result.white_balance = this.cleanStringValue(tags.WhiteBalance);
    result.saturation = this.parseNumber(this.extractSaturation(tags.Saturation));
    result.contrast = this.cleanStringValue(tags.Contrast);
    result.sharpness = this.cleanStringValue(tags.Sharpness);
    result.scene_capture_type = this.cleanStringValue(tags.SceneCaptureType);
    result.custom_rendered = this.formatCustomRendered(tags.CustomRendered);
    result.sensing_method = this.formatSensingMethod(tags.SensingMethod);

    // 颜色空间
    result.color_space = this.cleanStringValue(tags.ColorSpace);

    // 图像质量
    result.quality = this.cleanStringValue(tags.Quality);
    result.image_generation = this.cleanStringValue(tags.ImageGeneration);
    result.image_count = this.parseNumber(tags.ImageCount);
    result.exposure_count = this.parseNumber(tags.ExposureCount);

    // Film Mode (胶片模式) - Fuji 特有
    result.film_mode = this.cleanStringValue(tags.FilmMode);
    result.dynamic_range = this.cleanStringValue(tags.DynamicRange);
    result.dynamic_range_setting = this.cleanStringValue(tags.DynamicRangeSetting);
    result.auto_dynamic_range = this.cleanStringValue(tags.AutoDynamicRange);
    result.shadow_tone = this.parseNumber(this.extractToneValue(tags.ShadowTone));
    result.highlight_tone = this.parseNumber(this.extractToneValue(tags.HighlightTone));

    // 图像效果 - Fuji 特有
    result.lens_modulation_optimizer = this.formatOnOff(tags.LensModulationOptimizer);
    result.grain_effect = this.cleanStringValue(tags.GrainEffectRoughness || tags.GrainEffect);
    result.color_chrome_effect = this.cleanStringValue(tags.ColorChromeEffect);
    result.color_chrome_fx_blue = this.formatOnOff(tags.ColorChromeFXBlue);

    // 拍摄模式
    result.shutter_type = this.cleanStringValue(tags.ShutterType);
    result.auto_bracketing = this.formatOnOff(tags.AutoBracketing);
    result.sequence_number = this.parseNumber(tags.SequenceNumber);
    result.drive_mode = this.cleanStringValue(tags.DriveMode);
    result.drive_speed = this.cleanStringValue(tags.DriveSpeed);
    result.crop_mode = this.cleanStringValue(tags.CropMode);

    // 警告信息
    result.blur_warning = this.formatWarning(tags.BlurWarning);
    result.focus_warning = this.formatWarning(tags.FocusWarning);
    result.exposure_warning = this.formatWarning(tags.ExposureWarning);

    // 脸部检测
    result.flicker_reduction = this.cleanStringValue(tags.FlickerReduction);
    result.faces_detected = this.parseNumber(tags.FaceDetected || tags.FacesDetected);
    result.num_face_elements = this.parseNumber(tags.NumFaceElements);
    result.face_index = this.parseNumber(tags.FaceIndex);
    result.face_detected = this.parseNumber(tags.FaceDetected);
    result.recognized_face_count = this.parseNumber(tags.RecognizedFaceCount);

    // 元数据版本
    result.exif_version = this.formatHexVersion(tags.ExifVersion);
    result.flashpix_version = this.formatHexVersion(tags.FlashpixVersion);
    result.components_configuration = this.cleanStringValue(tags.ComponentsConfiguration);
    result.subject_distance_range = this.cleanStringValue(tags.SubjectDistanceRange);
    result.scene_capture = this.cleanStringValue(tags.SceneCapture || tags.SceneType);
    result.scene_type = this.formatSceneType(tags.SceneType);
    result.file_source = this.formatFileSource(tags.FileSource);

    // 互操作性
    result.interoperability_index = this.cleanStringValue(tags.InteroperabilityIndex);

    // 图像稳定
    result.image_stabilization = this.cleanStringValue(tags.ImageStabilization);

    // GPS
    if (tags.GPSLatitude && tags.GPSLongitude) {
      result.gps_latitude = this.parseGPSCoordinate(tags.GPSLatitude);
      result.gps_longitude = this.parseGPSCoordinate(tags.GPSLongitude);
    }

    // 其他
    result.user_comment = this.cleanStringValue(tags.UserComment);
    result.rating = this.parseNumber(tags.Rating);

    return result;
  }

  // ==================== 辅助方法 ====================

  private cleanStringValue(value: any): string | undefined {
    if (value === undefined || value === null) return undefined;
    const str = String(value).trim();
    return str || undefined;
  }

  private parseNumber(value: any): number | undefined {
    if (value === undefined || value === null) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  private formatExposureTime(value: any): string | undefined {
    if (!value) return undefined;
    const str = String(value);
    if (str.includes('/')) return str;
    const num = parseFloat(str);
    if (isNaN(num)) return str;
    if (num < 1) {
      const reciprocal = Math.round(1 / num);
      return `1/${reciprocal}`;
    }
    return str;
  }

  private formatExposureProgram(value: any): string | undefined {
    if (!value) return undefined;
    const programs: Record<string, string> = {
      '0': 'Not defined',
      '1': 'Manual',
      '2': 'Normal program',
      '3': 'Aperture-priority AE',
      '4': 'Shutter-priority AE',
      '5': 'Creative program',
      '6': 'Action program',
      '7': 'Portrait mode',
      '8': 'Landscape mode',
      '9': 'Bulb',
    };
    return programs[String(value)] || String(value);
  }

  private formatExposureMode(value: any): string | undefined {
    if (!value) return undefined;
    const modes: Record<string, string> = {
      '0': 'Auto',
      '1': 'Manual',
      '2': 'Auto bracket',
    };
    return modes[String(value)] || String(value);
  }

  private formatMeteringMode(value: any): string | undefined {
    if (!value) return undefined;
    const modes: Record<string, string> = {
      '0': 'Unknown',
      '1': 'Average',
      '2': 'Center-weighted average',
      '3': 'Spot',
      '4': 'Multi-spot',
      '5': 'Multi-segment',
      '6': 'Partial',
      '255': 'Other',
    };
    return modes[String(value)] || String(value);
  }

  private formatLightSource(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    return String(value);
  }

  private formatFlash(value: any): string | undefined {
    if (!value) return undefined;
    const str = String(value).toLowerCase();
    if (str.includes('did not fire') || str === 'no') return 'Did not fire';
    if (str.includes('fired') || str === 'yes') return 'Fired';
    return String(value);
  }

  private formatCustomRendered(value: any): string | undefined {
    if (!value) return undefined;
    return value === 0 || String(value).toLowerCase() === 'normal' ? 'Normal' : 'Custom';
  }

  private formatSensingMethod(value: any): string | undefined {
    if (!value) return undefined;
    return String(value);
  }

  private formatOrientation(value: any): string | undefined {
    if (!value) return undefined;
    const orientations: Record<string, string> = {
      '1': 'Horizontal (normal)',
      '2': 'Mirror horizontal',
      '3': 'Rotate 180',
      '4': 'Mirror vertical',
      '5': 'Mirror horizontal and rotate 270 CW',
      '6': 'Rotate 90 CW',
      '7': 'Mirror horizontal and rotate 90 CW',
      '8': 'Rotate 270 CW',
    };
    return orientations[String(value)] || undefined;
  }

  private formatResolutionUnit(value: any): string | undefined {
    if (!value) return undefined;
    return value === 1 ? 'inches' : value === 2 ? 'cm' : undefined;
  }

  private formatSceneType(value: any): string | undefined {
    if (!value) return undefined;
    if (value === 1 || String(value) === 'Directly photographed') {
      return 'Directly photographed';
    }
    return String(value);
  }

  private formatFileSource(value: any): string | undefined {
    if (!value) return undefined;
    if (value === 3 || String(value) === 'Digital Camera') {
      return 'Digital Camera';
    }
    return String(value);
  }

  private formatOnOff(value: any): string | undefined {
    if (!value) return undefined;
    const str = String(value).toLowerCase();
    if (str.includes('off') || str === 'no' || str === '0' || str === 'n/a') return 'Off';
    if (str.includes('on') || str === 'yes' || str === '1') return 'On';
    return String(value);
  }

  private formatWarning(value: any): string | undefined {
    if (!value) return undefined;
    if (value === 0) return 'None';
    if (value === 1) return 'Warning';
    return String(value);
  }

  private formatHexVersion(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') {
      return value.toString(16).toUpperCase().padStart(4, '0');
    }
    const str = String(value);
    if (/^[0-9a-fA-F]+$/.test(str)) {
      return str;
    }
    return str;
  }

  private parseGPSCoordinate(value: any): number | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') return value;
    const num = parseFloat(String(value));
    return isNaN(num) ? undefined : num;
  }

  /**
   * 从 FujiModel 提取纯型号（如 "X-T50_0100" -> "X-T50"）
   */
  private extractModelFrom(fujiModel: any): string | undefined {
    if (!fujiModel) return undefined;
    const str = String(fujiModel);
    return str.replace(/_\d+$/, '').replace(/_/g, '-') || undefined;
  }

  /**
   * 提取饱和度数值（从 "0 (normal)" 这样的字符串中提取数值）
   */
  private extractSaturation(value: any): number | string | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') return value;
    const str = String(value);
    const match = str.match(/^(-?\d+)/);
    if (match) return parseInt(match[1], 10);
    return str;
  }

  /**
   * 提取 Tone 值（从 "0 (normal)" 这样的字符串中提取数值）
   */
  private extractToneValue(value: any): number | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') return value;
    const str = String(value);
    const match = str.match(/^(-?\d+)/);
    if (match) return parseInt(match[1], 10);
    return undefined;
  }
}

export default ImageService;
