import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { fileTypeFromBuffer } from 'file-type';
import { v4 as uuidv4 } from 'uuid';
import { appConfig } from '../config/index';
import type { Asset, ExifData, VideoMetadata } from '../types/assets.types';
import type {
  AssetMetadataView,
  BatchActionResult,
  BrowseGroup,
  GroupMode,
  ImportResult,
  ImportSummary,
  LibraryFilters,
  LibraryHealth,
  LibrarySummaryExport,
  MediaAssetView,
  ProcessingHealth,
} from '../types/library.types';
import logger from '../middleware/logger';
import { calculateBufferHashAsync } from '../utils/hash';
import DatabaseService from './database.service';
import StorageService from './storage.service';
import ImageService from './image.service';
import VideoService from './video.service';

interface UploadLikeFile {
  originalname: string;
  size: number;
  path: string;
}

class LibraryService {
  private static instance: LibraryService;
  private readonly databaseService = DatabaseService.getInstance();
  private readonly storageService = StorageService.getInstance();
  private readonly imageService = ImageService.getInstance();
  private readonly videoService = VideoService.getInstance();

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
      groupBy: this.parseGroupMode(query.groupBy),
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

  async importUploadedFile(file: UploadLikeFile): Promise<ImportResult> {
    try {
      const buffer = readFileSync(file.path);
      const fileHash = await calculateBufferHashAsync(buffer);
      const existingAsset = this.databaseService.getAssetByHash(fileHash);
      if (existingAsset) {
        return this.recordAndCleanup(file, {
          inputName: file.originalname,
          status: 'duplicate',
          assetId: existingAsset.id,
          message: 'Already in library',
          mediaType: existingAsset.file_type,
          metadataAvailable: Boolean(
            existingAsset.id && (
              this.databaseService.getExifByAssetId(existingAsset.id)
              || this.databaseService.getVideoMetadataByAssetId(existingAsset.id)
            ),
          ),
          thumbnailAvailable: Boolean(existingAsset.thumbnail_path && existsSync(existingAsset.thumbnail_path)),
          nextAction: 'Open existing asset',
        });
      }

      const detected = await fileTypeFromBuffer(buffer);
      if (!detected) {
        return this.recordAndCleanup(file, this.failedImport(file.originalname, 'unsupported', 'Could not detect file type', 'undetected-type'));
      }
      if (!detected.mime.startsWith('image/') && !detected.mime.startsWith('video/')) {
        return this.recordAndCleanup(file, this.failedImport(file.originalname, 'unsupported', `Unsupported file type: ${detected.mime}`, 'unsupported-type'));
      }

      const uploadResult = this.storageService.uploadFile(file);
      this.cleanupTemp(file.path);
      const mediaType: 'image' | 'video' = detected.mime.startsWith('image/') ? 'image' : 'video';
      const thumbnailUuid = uuidv4();
      let width: number | undefined;
      let height: number | undefined;
      let thumbnailPath: string | undefined;
      let exif: ExifData | undefined;
      let videoMetadata: VideoMetadata | undefined;

      if (mediaType === 'image') {
        const ext = detected.ext ? `.${detected.ext}` : '.jpg';
        const thumbPath = this.storageService.getThumbnailPath(thumbnailUuid, ext);
        try {
          const processResult = await this.imageService.processImage(uploadResult.filePath, detected.mime, detected.ext, thumbPath, 512, 0);
          if (processResult.canProcess) {
            width = processResult.width;
            height = processResult.height;
            thumbnailPath = processResult.thumbnailPath;
          }
        } catch (error) {
          logger.warn('[LibraryService] Image processing failed during batch import', { error, filename: file.originalname });
        }
      } else {
        try {
          const dimensions = await this.videoService.getVideoDimensions(uploadResult.filePath);
          width = dimensions.width;
          height = dimensions.height;
          thumbnailPath = await this.videoService.generateVideoThumbnail(
            uploadResult.filePath,
            this.storageService.getThumbnailPath(thumbnailUuid, '.jpg'),
            512,
          );
        } catch (error) {
          logger.warn('[LibraryService] Video processing failed during batch import', { error, filename: file.originalname });
        }
      }

      const createdAsset = this.databaseService.createAsset({
        original_name: file.originalname,
        stored_name: uploadResult.storedName,
        file_path: uploadResult.filePath,
        thumbnail_path: thumbnailPath,
        mime_type: detected.mime,
        file_type: mediaType,
        file_size: file.size,
        width,
        height,
        file_hash: fileHash,
        created_at: Date.now(),
      });

      if (mediaType === 'image' && createdAsset.id) {
        try {
          const extracted = await this.imageService.extractExif(uploadResult.filePath, createdAsset.id);
          if (extracted) {
            this.databaseService.createExif(extracted);
            exif = this.databaseService.getExifByAssetId(createdAsset.id);
          }
        } catch (error) {
          logger.warn('[LibraryService] EXIF extraction failed during batch import', { error, filename: file.originalname });
        }
      }
      if (mediaType === 'video' && createdAsset.id) {
        try {
          const extracted = await this.videoService.extractVideoMetadata(uploadResult.filePath, createdAsset.id);
          if (extracted) {
            this.databaseService.createVideoMetadata(extracted);
            videoMetadata = this.databaseService.getVideoMetadataByAssetId(createdAsset.id);
          }
        } catch (error) {
          logger.warn('[LibraryService] Video metadata extraction failed during batch import', { error, filename: file.originalname });
        }
      }

      const result: ImportResult = {
        inputName: file.originalname,
        status: 'accepted',
        assetId: createdAsset.id,
        message: 'Imported',
        mediaType: createdAsset.file_type,
        metadataAvailable: Boolean(exif || videoMetadata),
        thumbnailAvailable: Boolean(createdAsset.thumbnail_path && existsSync(createdAsset.thumbnail_path)),
        nextAction: 'Open details',
      };
      this.databaseService.recordImportEvent(result);
      return result;
    } catch (error) {
      logger.warn('[LibraryService] Batch import file failed', { error, filename: file.originalname });
      return this.recordAndCleanup(file, this.failedImport(file.originalname, 'failed', 'Failed to import file', 'import-error'));
    }
  }

  createImportSummary(results: ImportResult[]): ImportSummary {
    return results.reduce<ImportSummary>((summary, result) => {
      summary.total += 1;
      if (result.status in summary) {
        summary[result.status as keyof ImportSummary] += 1;
      }
      if (['accepted', 'duplicate', 'unsupported', 'failed', 'completed'].includes(result.status)) {
        summary.completed += 1;
      }
      return summary;
    }, { total: 0, queued: 0, uploading: 0, accepted: 0, duplicate: 0, unsupported: 0, failed: 0, completed: 0 });
  }

  groupAssets(filters: LibraryFilters): BrowseGroup[] {
    const mode: GroupMode = filters.groupBy || 'flat';
    if (mode === 'flat') return [];
    const assets = this.listAssets({ ...filters, limit: Number.MAX_SAFE_INTEGER, offset: 0, groupBy: 'flat' }).assets;
    const groups = new Map<string, MediaAssetView[]>();
    for (const asset of assets) {
      const key = this.groupKey(asset, mode);
      const current = groups.get(key) || [];
      current.push(asset);
      groups.set(key, current);
    }
    return [...groups.entries()].map(([key, groupedAssets]) => ({
      groupMode: mode,
      groupKey: key,
      label: this.groupLabel(key, mode),
      count: groupedAssets.length,
      assets: groupedAssets,
    }));
  }

  batchTags(assetIds: number[], tags: string[]): BatchActionResult {
    return this.batchResult('tag', assetIds, id => {
      const asset = this.databaseService.getAssetById(id);
      if (!asset) return 'Asset not found';
      const existing = this.databaseService.getTags(id);
      this.databaseService.replaceTags(id, [...existing, ...tags]);
      return undefined;
    });
  }

  batchFavorite(assetIds: number[], favorite: boolean): BatchActionResult {
    return this.batchResult(favorite ? 'favorite' : 'unfavorite', assetIds, id => {
      if (!this.databaseService.getAssetById(id)) return 'Asset not found';
      this.databaseService.setFavorite(id, favorite);
      return undefined;
    });
  }

  batchDelete(assetIds: number[]): BatchActionResult {
    return this.batchResult('delete', assetIds, id => {
      const asset = this.databaseService.getAssetById(id);
      if (!asset) return 'Asset not found';
      const deleted = this.databaseService.deleteAsset(id);
      if (deleted) {
        this.storageService.deleteFile(asset.file_path);
        if (asset.thumbnail_path) this.storageService.deleteFile(asset.thumbnail_path);
        return undefined;
      }
      return 'Asset could not be deleted';
    });
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

    const missingOriginalAssets = assets.filter(asset => !existsSync(asset.file_path)).map(asset => asset.id || 0).filter(Boolean);
    const missingThumbnailAssets = assets.filter(asset => !asset.thumbnail_path || !existsSync(asset.thumbnail_path)).map(asset => asset.id || 0).filter(Boolean);
    const missingMetadataAssets = assets.filter(asset => {
      const id = asset.id || 0;
      return !this.databaseService.getExifByAssetId(id) && !this.databaseService.getVideoMetadataByAssetId(id);
    }).map(asset => asset.id || 0).filter(Boolean);

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
      issues: [
        ...missingOriginalAssets.length ? [{
          issueType: 'missing-original' as const,
          severity: 'critical' as const,
          affectedAssetIds: missingOriginalAssets,
          summary: `${missingOriginalAssets.length} assets are missing original files`,
          recommendedAction: 'Restore originals from your own backup or delete stale catalog entries.',
          isRepairableNow: false,
        }] : [],
        ...missingThumbnailAssets.length ? [{
          issueType: 'missing-thumbnail' as const,
          severity: 'warning' as const,
          affectedAssetIds: missingThumbnailAssets,
          summary: `${missingThumbnailAssets.length} assets are missing thumbnails`,
          recommendedAction: 'Keep originals available; thumbnails can be regenerated in a future maintenance action.',
          isRepairableNow: false,
        }] : [],
        ...missingMetadataAssets.length ? [{
          issueType: 'missing-metadata' as const,
          severity: 'warning' as const,
          affectedAssetIds: missingMetadataAssets,
          summary: `${missingMetadataAssets.length} assets are missing extracted metadata`,
          recommendedAction: 'Inspect originals and retry import if metadata is important for organization.',
          isRepairableNow: false,
        }] : [],
        {
          issueType: 'export-boundary',
          severity: 'info',
          affectedAssetIds: [],
          summary: 'Summary export excludes original media files',
          recommendedAction: 'Back up original media directories separately before relying on the catalog.',
          isRepairableNow: false,
        },
      ],
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

  private parseGroupMode(value: unknown): GroupMode {
    return value === 'timeline' || value === 'tag' || value === 'camera' ? value : 'flat';
  }

  private parseDate(value: unknown): number | undefined {
    if (typeof value !== 'string' || !value.trim()) return undefined;
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private cleanupTemp(path: string): void {
    if (existsSync(path)) {
      unlinkSync(path);
    }
  }

  private failedImport(inputName: string, status: 'unsupported' | 'failed', message: string, reasonCode: string): ImportResult {
    return {
      inputName,
      status,
      message,
      metadataAvailable: false,
      thumbnailAvailable: false,
      reasonCode,
      nextAction: status === 'unsupported' ? 'Skip this file or convert it to a supported format' : 'Retry after checking the file',
    };
  }

  private recordAndCleanup(file: UploadLikeFile, result: ImportResult): ImportResult {
    this.cleanupTemp(file.path);
    this.databaseService.recordImportEvent(result);
    return result;
  }

  private groupKey(asset: MediaAssetView, mode: GroupMode): string {
    if (mode === 'timeline') {
      const date = asset.captureDate ? Date.parse(asset.captureDate) : asset.importedAt;
      if (!Number.isFinite(date)) return 'unknown-date';
      const parsed = new Date(date);
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
    }
    if (mode === 'tag') {
      return asset.tags[0] || 'untagged';
    }
    if (mode === 'camera') {
      return asset.metadata?.cameraModel || asset.metadata?.cameraMake || 'unknown-camera';
    }
    return 'flat';
  }

  private groupLabel(key: string, mode: GroupMode): string {
    if (key === 'unknown-date') return 'Unknown date';
    if (key === 'untagged') return 'Untagged';
    if (key === 'unknown-camera') return 'Unknown camera';
    if (mode === 'timeline') {
      const [year, month] = key.split('-');
      return `${year}-${month}`;
    }
    return key;
  }

  private batchResult(action: BatchActionResult['action'], assetIds: number[], apply: (id: number) => string | undefined): BatchActionResult {
    const successes: Array<{ assetId: number }> = [];
    const failures: Array<{ assetId: number; message: string }> = [];
    for (const id of new Set(assetIds.map(Number).filter(Number.isFinite))) {
      const message = apply(id);
      if (message) failures.push({ assetId: id, message });
      else successes.push({ assetId: id });
    }
    return {
      action,
      successes,
      failures,
      message: `${action} completed for ${successes.length} of ${successes.length + failures.length} assets`,
    };
  }
}

export default LibraryService;
