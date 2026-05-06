import { describe, expect, it } from 'vitest';
import LibraryService from '../../src/services/library.service';

describe('library export workflow', () => {
  it('exports an index object without original media bytes', () => {
    const summary = LibraryService.getInstance().getSummaryExport();

    expect(summary.exclusions).toContain('Original media files are not included');
    expect(JSON.stringify(summary)).not.toContain('data:video');
    expect(JSON.stringify(summary)).not.toContain('data:image');
  });
});
