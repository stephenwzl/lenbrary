import { describe, expect, it } from 'vitest';
import LibraryService from '../../src/services/library.service';

describe('library batch action integration', () => {
  it('handles missing assets as partial failure data', () => {
    const result = LibraryService.getInstance().batchTags([123456], ['test']);
    expect(result.failures[0].message).toBe('Asset not found');
  });
});
