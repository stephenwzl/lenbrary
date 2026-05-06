import { useState } from 'react';
import { batchDelete, batchFavorite, batchTags, getAsset, setFavorite, replaceTags } from '../api';
import type { MediaAssetView } from '../types';

export function useSelection(refreshLibrary: () => Promise<void>, refreshHealth: () => Promise<void>) {
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetView | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [operating, setOperating] = useState(false);

  const selectedCount = selectedIds.length;

  function toggleSelection(id: number) {
    setSelectedIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  async function openDetail(id: number) {
    try {
      setSelectedAsset(await getAsset(id));
    } catch {
      // Error handled by caller
    }
  }

  function closeDetail() {
    setSelectedAsset(null);
  }

  async function handleFavorite(asset: MediaAssetView) {
    await setFavorite(asset.id, !asset.favorite);
    await refreshLibrary();
  }

  async function handleTags(assetId: number, tags: string[]) {
    await replaceTags(assetId, tags);
    await refreshLibrary();
    await openDetail(assetId);
  }

  async function runBatchTags(tags: string[]) {
    setOperating(true);
    try {
      const result = await batchTags(selectedIds, tags);
      await refreshLibrary();
      return result;
    } finally {
      setOperating(false);
    }
  }

  async function runBatchFavorite(favorite: boolean) {
    setOperating(true);
    try {
      const result = await batchFavorite(selectedIds, favorite);
      await refreshLibrary();
      return result;
    } finally {
      setOperating(false);
    }
  }

  async function runBatchDelete() {
    setOperating(true);
    try {
      const result = await batchDelete(selectedIds);
      setSelectedIds([]);
      setSelectedAsset(null);
      await refreshLibrary();
      await refreshHealth();
      return result;
    } finally {
      setOperating(false);
    }
  }

  return {
    selectedAsset,
    selectedIds,
    selectedCount,
    operating,
    toggleSelection,
    clearSelection,
    openDetail,
    closeDetail,
    handleFavorite,
    handleTags,
    runBatchTags,
    runBatchFavorite,
    runBatchDelete,
  };
}
