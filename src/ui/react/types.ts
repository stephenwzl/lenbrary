export type ImportStatus = 'queued' | 'uploading' | 'accepted' | 'duplicate' | 'unsupported' | 'failed' | 'completed' | 'processing-pending';
export type GroupMode = 'flat' | 'timeline' | 'tag' | 'camera';
export type Severity = 'info' | 'warning' | 'critical';

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
  processingHealth: string;
}

export interface ImportQueueItem {
  inputName: string;
  status: ImportStatus;
  assetId?: number;
  message: string;
  mediaType?: 'image' | 'video';
  metadataAvailable: boolean;
  thumbnailAvailable: boolean;
  nextAction?: string;
}

export interface ImportSummary {
  total: number;
  queued: number;
  uploading: number;
  accepted: number;
  duplicate: number;
  unsupported: number;
  failed: number;
  completed: number;
}

export interface BatchActionResult {
  action: 'tag' | 'favorite' | 'unfavorite' | 'delete';
  successes: Array<{ assetId: number }>;
  failures: Array<{ assetId: number; message: string }>;
  message: string;
}

export interface BrowseGroup {
  groupMode: GroupMode;
  groupKey: string;
  label: string;
  count: number;
  assets: MediaAssetView[];
}

export interface HealthIssue {
  issueType: 'missing-original' | 'missing-thumbnail' | 'missing-metadata' | 'duplicate-import' | 'export-boundary';
  severity: Severity;
  affectedAssetIds: number[];
  summary: string;
  recommendedAction: string;
  isRepairableNow: boolean;
}

export interface LibraryHealth {
  assetCounts: { total: number; image: number; video: number };
  issueCounts: { missingThumbnails: number; missingMetadata: number; missingOriginals: number };
  duplicateCount: number;
  storageGuidance: { originals: string; thumbnails: string; database: string };
  checkedAt: number;
  issues?: HealthIssue[];
}

export interface FilterState {
  type: '' | 'image' | 'video';
  favorite: '' | 'true' | 'false';
  tag: string;
  camera: string;
  dateFrom: string;
  dateTo: string;
  hasThumbnail: '' | 'true' | 'false';
  hasMetadata: '' | 'true' | 'false';
  groupBy: GroupMode;
}
