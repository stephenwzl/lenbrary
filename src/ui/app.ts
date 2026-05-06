export type BoolFilter = '' | 'true' | 'false';
export type MediaTypeFilter = '' | 'image' | 'video';
export type ImportQueueStatus = 'queued' | 'uploading' | 'accepted' | 'duplicate' | 'unsupported' | 'failed' | 'completed';

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
  metadata?: Record<string, unknown>;
  favorite: boolean;
  tags: string[];
  processingHealth: string;
}

export interface FilterSet {
  type: MediaTypeFilter;
  favorite: BoolFilter;
  camera: string;
  tag: string;
  dateFrom: string;
  dateTo: string;
  hasThumbnail: BoolFilter;
  hasMetadata: BoolFilter;
}

export interface ImportQueueItem {
  id: string;
  name: string;
  status: ImportQueueStatus;
  message: string;
  assetId?: number;
}

export interface LibraryViewState {
  assets: MediaAssetView[];
  selectedAssetId?: number;
  offset: number;
  hasMore: boolean;
  loading: boolean;
  filters: FilterSet;
  importQueue: ImportQueueItem[];
}

export function createLibraryQuery(filters: FilterSet, limit: number, offset: number): string {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (filters.type) params.set('type', filters.type);
  if (filters.favorite) params.set('favorite', filters.favorite);
  if (filters.camera) params.set('camera', filters.camera);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.hasThumbnail) params.set('hasThumbnail', filters.hasThumbnail);
  if (filters.hasMetadata) params.set('hasMetadata', filters.hasMetadata);
  return params.toString();
}

// The served browser module is app.js. This typed file documents the mirrored
// client state contract without requiring a frontend build step for the MVP UI.
