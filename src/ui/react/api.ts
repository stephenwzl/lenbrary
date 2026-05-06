import type { BatchActionResult, BrowseGroup, FilterState, ImportQueueItem, ImportSummary, LibraryHealth, MediaAssetView } from './types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: { limit: number; offset: number; hasMore?: boolean };
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function createLibraryQuery(filters: FilterState, limit: number, offset: number): string {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}

export async function listAssets(filters: FilterState, limit = 50, offset = 0): Promise<{
  assets: MediaAssetView[];
  groups?: BrowseGroup[];
  hasMore: boolean;
}> {
  const payload = await request<ApiResponse<MediaAssetView[] | BrowseGroup[]>>(`/api/library/assets?${createLibraryQuery(filters, limit, offset)}`);
  const isGrouped = filters.groupBy !== 'flat';
  return {
    assets: isGrouped ? [] : payload.data as MediaAssetView[],
    groups: isGrouped ? payload.data as BrowseGroup[] : undefined,
    hasMore: Boolean(payload.pagination?.hasMore),
  };
}

export async function getAsset(id: number): Promise<MediaAssetView> {
  const payload = await request<ApiResponse<MediaAssetView>>(`/api/library/assets/${id}`);
  return payload.data;
}

export async function importFiles(files: File[]): Promise<{ results: ImportQueueItem[]; summary: ImportSummary }> {
  const form = new FormData();
  files.forEach(file => form.append('files', file));
  const payload = await request<ApiResponse<{ results: ImportQueueItem[]; summary: ImportSummary }>>('/api/library/import', {
    method: 'POST',
    body: form,
  });
  return payload.data;
}

export async function setFavorite(assetId: number, favorite: boolean): Promise<void> {
  await request(`/api/library/assets/${assetId}/favorite`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ favorite }),
  });
}

export async function replaceTags(assetId: number, tags: string[]): Promise<void> {
  await request(`/api/library/assets/${assetId}/tags`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags }),
  });
}

export async function batchTags(assetIds: number[], tags: string[]): Promise<BatchActionResult> {
  const payload = await request<ApiResponse<BatchActionResult>>('/api/library/assets/batch/tags', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetIds, tags, mode: 'add' }),
  });
  return payload.data;
}

export async function batchFavorite(assetIds: number[], favorite: boolean): Promise<BatchActionResult> {
  const payload = await request<ApiResponse<BatchActionResult>>('/api/library/assets/batch/favorite', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetIds, favorite }),
  });
  return payload.data;
}

export async function batchDelete(assetIds: number[]): Promise<BatchActionResult> {
  const payload = await request<ApiResponse<BatchActionResult>>('/api/library/assets/batch', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetIds, confirmed: true }),
  });
  return payload.data;
}

export async function getHealth(): Promise<LibraryHealth> {
  const payload = await request<ApiResponse<LibraryHealth>>('/api/library/health');
  return payload.data;
}
