import { describe, expect, it } from 'vitest';
import LibraryService from '../../src/services/library.service';

describe('batch action contract', () => {
  it('reports per-asset failures without throwing the whole batch', () => {
    const result = LibraryService.getInstance().batchFavorite([999999], true);

    expect(result).toMatchObject({
      action: 'favorite',
      successes: [],
      failures: [{ assetId: 999999, message: 'Asset not found' }],
    });
  });
});
