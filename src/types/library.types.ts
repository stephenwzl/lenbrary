import type { Asset, ExifData, VideoMetadata } from './assets.types';

export type ImportStatus = 'accepted' | 'duplicate' | 'unsupported' | 'failed' | 'processing-pending';
export type ProcessingHealth = 'normal' | 'missing-thumbnail' | 'missing-metadata' | 'missing-original' | 'mixed-issues';

export interface LibraryFilters {
  limit: number;
  offset: number;
  type?: 'image' | 'video';
  favorite?: boolean;
  tag?: string;
  dateFrom?: number;
  dateTo?: number;
  camera?: string;
  hasThumbnail?: boolean;
  hasMetadata?: boolean;
}

export interface AssetMetadataView {
  metadataType: 'image' | 'video';
  captureDate?: string;
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  exposureSummary?: string;
  videoDuration?: number;
  videoCodec?: string;
  frameRate?: number;
  rawAvailable: boolean;
}

export interface MediaAssetView {
  id: number;
  originalName: string;
  mediaType: 'image' | 'video';
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  importedAt: number;
  captureDate?: string;
  thumbnailAvailable: boolean;
  thumbnailUrl?: string;
  fileAvailable: boolean;
  fileUrl: string;
  duplicateIdentity?: string;
  metadataAvailable: boolean;
  metadata?: AssetMetadataView;
  favorite: boolean;
  tags: string[];
  processingHealth: ProcessingHealth;
}

export interface ImportResult {
  inputName: string;
  status: ImportStatus;
  assetId?: number;
  message: string;
  mediaType?: 'image' | 'video';
  metadataAvailable: boolean;
  thumbnailAvailable: boolean;
}

export interface LibraryHealth {
  assetCounts: {
    total: number;
    image: number;
    video: number;
  };
  issueCounts: {
    missingThumbnails: number;
    missingMetadata: number;
    missingOriginals: number;
  };
  duplicateCount: number;
  storageGuidance: {
    originals: string;
    thumbnails: string;
    database: string;
  };
  checkedAt: number;
}

export interface LibrarySummaryExport {
  exportedAt: string;
  exclusions: string;
  librarySummary: LibraryHealth;
  assets: MediaAssetView[];
}

export interface AssetRecordBundle {
  asset: Asset;
  exif?: ExifData;
  videoMetadata?: VideoMetadata;
  favorite: boolean;
  tags: string[];
}
