import { describe, expect, it } from 'vitest';
import { createLibraryQuery } from '@/api';
import type { FilterState } from '../../src/ui/react/types';

describe('UI filter state helpers', () => {
  it('generates library query parameters for all active filters', () => {
    const filters: FilterState = {
      type: 'image',
      favorite: 'true',
      camera: 'fujifilm',
      tag: 'portfolio',
      dateFrom: '2026-01-01',
      dateTo: '2026-05-06',
      hasThumbnail: 'false',
      hasMetadata: 'true',
      groupBy: 'flat',
    };

    expect(createLibraryQuery(filters, 40, 80)).toBe('limit=40&offset=80&type=image&favorite=true&camera=fujifilm&tag=portfolio&dateFrom=2026-01-01&dateTo=2026-05-06&hasThumbnail=false&hasMetadata=true&groupBy=flat');
  });
});
