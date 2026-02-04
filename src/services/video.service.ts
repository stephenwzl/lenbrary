import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';
import logger from '../middleware/logger';

interface VideoDimensions {
  width: number;
  height: number;
}

interface VideoMetadata {
  asset_id: number;
  duration?: number;
  video_codec?: string;
  video_bitrate?: number;
  audio_codec?: string;
  audio_bitrate?: number;
  audio_sample_rate?: number;
  audio_channels?: number;
  frame_rate?: number;
  pixel_format?: string;
  color_space?: string;
  color_primaries?: string;
  color_transfer?: string;
  color_range?: string;
  is_hdr?: number;
  hdr_format?: string;
  bit_depth?: number;
  streams_video?: number;
  streams_audio?: number;
  streams_subtitle?: number;
  total_bitrate?: number;
  raw_metadata?: string;
}

class VideoService {
  private static instance: VideoService;

  private constructor() {}

  static getInstance(): VideoService {
    if (!VideoService.instance) {
      VideoService.instance = new VideoService();
    }
    return VideoService.instance;
  }

  /**
   * 生成视频缩略图
   * @param videoPath 视频文件路径
   * @param thumbnailPath 缩略图保存路径
   * @param size 缩略图最大尺寸（最长边不超过此值）
   * @returns 生成的缩略图路径
   */
  async generateVideoThumbnail(
    videoPath: string,
    thumbnailPath: string,
    size: number = 512,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      logger.debug('[VideoService] Generating video thumbnail', {
        videoPath,
        thumbnailPath,
        size,
      });

      ffmpeg(videoPath)
        .seekInput(1) // 跳转到第1秒
        .frames(1) // 只取1帧
        // 只限制最长边为 size，保持原始宽高比
        .outputOptions(
          '-vf', `scale='if(gt(iw,ih),${size},-1)':'if(gt(ih,iw),${size},-1)'`
        )
        .outputOptions('-preset', 'ultrafast') // 快速编码
        .outputFormat('mjpeg') // FFmpeg 使用 mjpeg 格式
        .outputOption('-q:v', '2') // JPEG 质量 (2-31, 值越小质量越高)
        .on('end', () => {
          logger.info('[VideoService] Video thumbnail generated', { thumbnailPath });
          resolve(thumbnailPath);
        })
        .on('error', (err) => {
          logger.error('[VideoService] Failed to generate video thumbnail', {
            error: err.message,
            videoPath,
          });
          reject(new Error(`Failed to generate video thumbnail: ${err.message}`));
        })
        .save(thumbnailPath);
    });
  }

  /**
   * 获取视频尺寸
   * @param videoPath 视频文件路径
   * @returns 视频宽高
   */
  async getVideoDimensions(videoPath: string): Promise<VideoDimensions> {
    return new Promise((resolve, reject) => {
      logger.debug('[VideoService] Getting video dimensions', { videoPath });

      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          logger.error('[VideoService] Failed to get video dimensions', {
            error: err.message,
            videoPath,
          });
          reject(new Error(`Failed to get video dimensions: ${err.message}`));
          return;
        }

        const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found in the file'));
          return;
        }

        const dimensions: VideoDimensions = {
          width: videoStream.width || 0,
          height: videoStream.height || 0,
        };

        logger.debug('[VideoService] Video dimensions retrieved', dimensions);
        resolve(dimensions);
      });
    });
  }

  /**
   * 提取视频元数据
   * @param videoPath 视频文件路径
   * @param assetId 资产ID
   * @returns 视频元数据
   */
  async extractVideoMetadata(
    videoPath: string,
    assetId: number,
  ): Promise<VideoMetadata | null> {
    return new Promise((resolve) => {
      logger.debug('[VideoService] Extracting video metadata', { videoPath, assetId });

      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          logger.error('[VideoService] Failed to extract video metadata', {
            error: err.message,
            videoPath,
          });
          return resolve(null);
        }

        try {
          const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
          const audioStream = metadata.streams.find((s) => s.codec_type === 'audio');

          // 检测 HDR 和 HDR 格式
          const hdrInfo = this.detectHDR(videoStream, metadata);

          const videoMetadata: VideoMetadata = {
            asset_id: assetId,
            duration: metadata.format.duration,
            video_codec: videoStream?.codec_name,
            video_bitrate: metadata.format.bit_rate
              ? parseInt(String(metadata.format.bit_rate), 10)
              : undefined,
            audio_codec: audioStream?.codec_name,
            audio_bitrate: audioStream?.bit_rate
              ? parseInt(String(audioStream.bit_rate), 10)
              : undefined,
            audio_sample_rate: audioStream?.sample_rate
              ? parseInt(String(audioStream.sample_rate), 10)
              : undefined,
            audio_channels: audioStream?.channels,
            frame_rate: this.parseFrameRate(videoStream),
            pixel_format: videoStream?.pix_fmt,
            color_space: videoStream?.tags?.['COLOR_SPACE'] as string,
            color_primaries: videoStream?.color_primaries as string,
            color_transfer: videoStream?.color_transfer as string,
            color_range: videoStream?.color_range as string,
            is_hdr: hdrInfo.isHdr ? 1 : 0,
            hdr_format: hdrInfo.format,
            bit_depth: this.parseBitDepth(videoStream),
            streams_video: metadata.streams.filter((s) => s.codec_type === 'video')
              .length,
            streams_audio: metadata.streams.filter((s) => s.codec_type === 'audio')
              .length,
            streams_subtitle: metadata.streams.filter((s) => s.codec_type === 'subtitle')
              .length,
            total_bitrate: metadata.format.bit_rate
              ? parseInt(String(metadata.format.bit_rate), 10)
              : undefined,
            raw_metadata: JSON.stringify(metadata),
          };

          logger.info('[VideoService] Video metadata extracted', {
            assetId,
            hasVideo: !!videoStream,
            hasAudio: !!audioStream,
            isHdr: hdrInfo.isHdr,
            hdrFormat: hdrInfo.format,
          });

          resolve(videoMetadata);
        } catch (error) {
          logger.error('[VideoService] Error parsing video metadata', {
            error: error instanceof Error ? error.message : String(error),
            videoPath,
          });
          resolve(null);
        }
      });
    });
  }

  /**
   * 检测 HDR 格式
   * @param videoStream 视频流
   * @param metadata FFprobe 元数据
   * @returns HDR 信息
   */
  private detectHDR(
    videoStream: any,
    metadata: FfprobeData,
  ): { isHdr: boolean; format?: string } {
    if (!videoStream) return { isHdr: false };

    const colorTransfer = videoStream.color_transfer?.toLowerCase();
    const colorPrimaries = videoStream.color_primaries?.toLowerCase();
    const tags = videoStream.tags || {};
    const formatTags = metadata.format.tags || {};

    // 检测 Dolby Vision
    if (tags['dolby_vision_version'] || formatTags['dolby_vision']) {
      return { isHdr: true, format: 'Dolby Vision' };
    }

    // 检测 HDR10+ (SMPTE ST-2094-40)
    if (tags['hdrgainmap'] || formatTags['hdrgainmap']) {
      return { isHdr: true, format: 'HDR10+' };
    }

    // 检测 HDR10 (SMPTE ST-2086)
    if (colorTransfer === 'smpte2084' || colorPrimaries === 'bt2020') {
      return { isHdr: true, format: 'HDR10' };
    }

    // 检测 HLG (Hybrid Log-Gamma)
    if (colorTransfer === 'arib-std-b67') {
      return { isHdr: true, format: 'HLG' };
    }

    // 检测其他 HDR 标记
    if (tags['hdr'] || formatTags['hdr'] || tags['HDR'] || formatTags['HDR']) {
      return { isHdr: true, format: 'HDR' };
    }

    return { isHdr: false };
  }

  /**
   * 解析帧率
   * @param videoStream 视频流
   * @returns 帧率
   */
  private parseFrameRate(videoStream: any): number | undefined {
    if (!videoStream) return undefined;

    // 尝试从 r_frame_rate 解析
    if (videoStream.r_frame_rate) {
      const parts = videoStream.r_frame_rate.split('/');
      if (parts.length === 2) {
        const numerator = parseInt(parts[0], 10);
        const denominator = parseInt(parts[1], 10);
        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
          return numerator / denominator;
        }
      }
    }

    // 尝试从 avg_frame_rate 解析
    if (videoStream.avg_frame_rate) {
      const parts = videoStream.avg_frame_rate.split('/');
      if (parts.length === 2) {
        const numerator = parseInt(parts[0], 10);
        const denominator = parseInt(parts[1], 10);
        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
          return numerator / denominator;
        }
      }
    }

    return undefined;
  }

  /**
   * 解析位深
   * @param videoStream 视频流
   * @returns 位深
   */
  private parseBitDepth(videoStream: any): number | undefined {
    if (!videoStream) return undefined;

    if (videoStream.bits_per_raw_sample) {
      return parseInt(videoStream.bits_per_raw_sample, 10);
    }

    if (videoStream.bits_per_sample) {
      return parseInt(videoStream.bits_per_sample, 10);
    }

    // 从像素格式推断位深
    if (videoStream.pix_fmt) {
      const pixFmt = videoStream.pix_fmt.toLowerCase();
      if (pixFmt.includes('p10') || pixFmt.includes('10bit')) return 10;
      if (pixFmt.includes('p12') || pixFmt.includes('12bit')) return 12;
      if (pixFmt.includes('p8') || pixFmt.includes('8bit') || pixFmt === 'yuv420p') {
        return 8;
      }
    }

    return undefined;
  }
}

export default VideoService;
export type { VideoDimensions, VideoMetadata };
