import { describe, expect, it } from 'vitest';
import LibraryService from '../../src/services/library.service';

describe('library grouped listing integration', () => {
  it('returns timeline groups with stable fields', () => {
    const groups = LibraryService.getInstance().groupAssets({ limit: 50, offset: 0, groupBy: 'timeline' });
    expect(Array.isArray(groups)).toBe(true);
    groups.forEach(group => {
      expect(group.groupMode).toBe('timeline');
      expect(group.label).toBeTruthy();
      expect(group.count).toBe(group.assets.length);
    });
  });
});
