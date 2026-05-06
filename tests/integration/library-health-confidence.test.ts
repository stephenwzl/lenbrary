import { describe, expect, it } from 'vitest';
import LibraryService from '../../src/services/library.service';

describe('library health confidence integration', () => {
  it('reports export boundary as an actionable issue', () => {
    const health = LibraryService.getInstance().getHealth();
    expect(health.issues.some(issue => issue.issueType === 'export-boundary')).toBe(true);
  });
});
