import { useMemo, useState } from 'react';
import type { FilterState } from '../types';

const emptyFilters: FilterState = {
  type: '',
  favorite: '',
  tag: '',
  camera: '',
  dateFrom: '',
  dateTo: '',
  hasThumbnail: '',
  hasMetadata: '',
  groupBy: 'flat',
};

export function useFilters(refreshLibrary: (filters: FilterState) => Promise<void>) {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([key, value]) => key !== 'groupBy' && value).length,
    [filters],
  );

  function updateFilter(key: keyof FilterState, value: string) {
    const next = { ...filters, [key]: value } as FilterState;
    setFilters(next);
    void refreshLibrary(next);
  }

  function clearFilters() {
    setFilters(emptyFilters);
    void refreshLibrary(emptyFilters);
  }

  return { filters, activeFilterCount, updateFilter, clearFilters };
}
