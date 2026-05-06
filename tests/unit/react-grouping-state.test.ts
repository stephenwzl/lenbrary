import { describe, expect, it } from 'vitest';
import { createLibraryQuery } from '../../src/ui/react/api';

describe('React grouping query state', () => {
  it('preserves filters when group mode changes', () => {
    const query = createLibraryQuery({
      type: 'image',
      favorite: 'true',
      tag: 'trip',
      camera: '',
      dateFrom: '',
      dateTo: '',
      hasThumbnail: '',
      hasMetadata: '',
      groupBy: 'timeline',
    }, 50, 0);

    expect(query).toContain('type=image');
    expect(query).toContain('favorite=true');
    expect(query).toContain('tag=trip');
    expect(query).toContain('groupBy=timeline');
  });
});
