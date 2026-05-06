import { useEffect, useState } from 'react';
import { listAssets } from '../api';
import type { BrowseGroup, FilterState, MediaAssetView } from '../types';

export function useLibrary(filters: FilterState) {
  const [assets, setAssets] = useState<MediaAssetView[]>([]);
  const [groups, setGroups] = useState<BrowseGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshLibrary(nextFilters = filters) {
    setLoading(true);
    setError(null);
    try {
      const result = await listAssets(nextFilters);
      setAssets(result.assets);
      setGroups(result.groups || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshLibrary();
  }, []);

  return { assets, groups, loading, error, refreshLibrary };
}
