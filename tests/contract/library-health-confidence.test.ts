import { describe, expect, it } from 'vitest';
import LibraryService from '../../src/services/library.service';

describe('health confidence contract', () => {
  it('includes actionable issue rows and export boundary guidance', () => {
    const health = LibraryService.getInstance().getHealth();

    expect(health.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        issueType: 'export-boundary',
        severity: 'info',
        recommendedAction: expect.stringContaining('Back up original media'),
      }),
    ]));
  });
});
