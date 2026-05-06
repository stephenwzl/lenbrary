import { existsSync } from 'node:fs';
import { appConfig } from '../config/index';
import type { Asset, ExifData, VideoMetadata } from '../types/assets.types';
import type {
  AssetMetadataView,
  ImportResult,
  LibraryFilters,
  LibraryHealth,
  LibrarySummaryExport,
  MediaAssetView,
  ProcessingHealth,
} from '../types/library.types';
import DatabaseService from './database.service';

class LibraryService {
  private static instance: LibraryService;
  private readonly databaseService = DatabaseService.getInstance();

  static getInstance(): LibraryService {
    if (!LibraryService.instance) {
      LibraryService.instance = new LibraryService();
    }
    return LibraryService.instance;
  }

  parseFilters(query: Record<string, unknown>): LibraryFilters {
    return {
      limit: Math.min(Number(query.limit) || 50, 200),
      offset: Number(query.offset) || 0,
      type: query.type === 'image' || query.type === 'video' ? query.type : undefined,
      favorite: this.parseBoolean(query.favorite),
      tag: typeof query.tag === 'string' && query.tag.trim() ? query.tag.trim() : undefined,
      dateFrom: this.parseDate(query.dateFrom),
      dateTo: this.parseDate(query.dateTo),
      camera: typeof query.camera === 'string' && query.camera.trim() ? query.camera.trim() : undefined,
      hasThumbnail: this.parseBoolean(query.hasThumbnail),
      hasMetadata: this.parseBoolean(query.hasMetadata),
    };
  }

  listAssets(filters: LibraryFilters): { assets: MediaAssetView[]; hasMore: boolean } {
    const rows = this.databaseService.getLibraryAssets({ ...filters, limit: filters.limit + 1 });
    const page = rows.slice(0, filters.limit);
    return {
      assets: page.map(asset => this.toMediaAssetView(asset)),
      hasMore: rows.length > filters.limit,
    };
  }

  getAssetDetail(id: number): MediaAssetView | undefined {
    const asset = this.databaseService.getAssetById(id);
    return asset ? this.toMediaAssetView(asset) : undefined;
  }

  toMediaAssetView(asset: Asset): MediaAssetView {
    const id = asset.id || 0;
    const exif = asset.file_type === 'image' ? this.databaseService.getExifByAssetId(id) : undefined;
    const videoMetadata = asset.file_type === 'video' ? this.databaseService.getVideoMetadataByAssetId(id) : undefined;
    const metadata = this.toMetadataView(asset, exif, videoMetadata);
    const thumbnailAvailable = Boolean(asset.thumbnail_path && existsSync(asset.thumbnail_path));
    const fileAvailable = existsSync(asset.file_path);
    const tags = this.databaseService.getTags(id);
    const favorite = this.databaseService.getFavorite(id);

    return {
      id,
      originalName: asset.original_name,
      mediaType: asset.file_type,
      mimeType: asset.mime_type,
      fileSize: asset.file_size,
      width: asset.width,
      height: asset.height,
      importedAt: asset.created_at,
      captureDate: metadata?.captureDate,
      thumbnailAvailable,
      thumbnailUrl: thumbnailAvailable ? `/api/assets/${id}/thumbnail` : undefined,
      fileAvailable,
      fileUrl: `/api/assets/${id}/file`,
      duplicateIdentity: asset.file_hash,
      metadataAvailable: Boolean(metadata),
      metadata,
      favorite,
      tags,
      processingHealth: this.getProcessingHealth(fileAvailable, thumbnailAvailable, Boolean(metadata)),
    };
  }

  getImportResultFromUpload(inputName: string, responseData: any, status: ImportResult['status']): ImportResult {
    const asset = responseData?.data;
    const metadataAvailable = Boolean(asset?.exif || asset?.videoMetadata);
    return {
      inputName,
      status,
      assetId: asset?.id,
      message: status === 'duplicate' ? 'Already in library' : 'Imported',
      mediaType: asset?.file_type,
      metadataAvailable,
      thumbnailAvailable: Boolean(asset?.thumbnail_path),
    };
  }

  setFavorite(assetId: number, favorite: boolean): boolean {
    return this.databaseService.setFavorite(assetId, favorite);
  }

  replaceTags(assetId: number, tags: string[]): string[] {
    return this.databaseService.replaceTags(assetId, tags);
  }

  getHealth(): LibraryHealth {
    const assets = this.databaseService.getAllAssetsForExport();
    const missingThumbnails = assets.filter(asset => !asset.thumbnail_path || !existsSync(asset.thumbnail_path)).length;
    const missingOriginals = assets.filter(asset => !existsSync(asset.file_path)).length;

    return {
      assetCounts: {
        total: this.databaseService.countAssetsByType(),
        image: this.databaseService.countAssetsByType('image'),
        video: this.databaseService.countAssetsByType('video'),
      },
      issueCounts: {
        missingThumbnails,
        missingMetadata: this.databaseService.countAssetsMissingMetadata(),
        missingOriginals,
      },
      duplicateCount: this.databaseService.countImportEventsByStatus('duplicate'),
      storageGuidance: {
        originals: appConfig.upload.dir,
        thumbnails: `${appConfig.upload.dir}/thumbnails`,
        database: appConfig.database.path,
      },
      checkedAt: Date.now(),
    };
  }

  getSummaryExport(): LibrarySummaryExport {
    return {
      exportedAt: new Date().toISOString(),
      exclusions: 'Original media files are not included in this MVP export.',
      librarySummary: this.getHealth(),
      assets: this.databaseService.getAllAssetsForExport().map(asset => this.toMediaAssetView(asset)),
    };
  }

  private toMetadataView(asset: Asset, exif?: ExifData, videoMetadata?: VideoMetadata): AssetMetadataView | undefined {
    if (asset.file_type === 'image' && exif) {
      return {
        metadataType: 'image',
        captureDate: exif.date_time_original || exif.datetime,
        cameraMake: exif.make,
        cameraModel: exif.model,
        lensModel: exif.lens_model,
        exposureSummary: this.exposureSummary(exif),
        rawAvailable: Boolean(exif.raw_exif),
      };
    }
    if (asset.file_type === 'video' && videoMetadata) {
      return {
        metadataType: 'video',
        videoDuration: videoMetadata.duration,
        videoCodec: videoMetadata.video_codec,
        frameRate: videoMetadata.frame_rate,
        rawAvailable: Boolean(videoMetadata.raw_metadata),
      };
    }
    return undefined;
  }

  private exposureSummary(exif: ExifData): string | undefined {
    const parts = [exif.exposure_time, exif.f_number ? `f/${exif.f_number}` : undefined, exif.iso ? `ISO ${exif.iso}` : undefined]
      .filter(Boolean);
    return parts.length > 0 ? parts.join(' · ') : undefined;
  }

  private getProcessingHealth(fileAvailable: boolean, thumbnailAvailable: boolean, metadataAvailable: boolean): ProcessingHealth {
    const issues = [!fileAvailable, !thumbnailAvailable, !metadataAvailable].filter(Boolean).length;
    if (issues === 0) return 'normal';
    if (issues > 1) return 'mixed-issues';
    if (!fileAvailable) return 'missing-original';
    if (!thumbnailAvailable) return 'missing-thumbnail';
    return 'missing-metadata';
  }

  private parseBoolean(value: unknown): boolean | undefined {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  }

  private parseDate(value: unknown): number | undefined {
    if (typeof value !== 'string' || !value.trim()) return undefined;
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}

export default LibraryService;
