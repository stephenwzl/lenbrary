import { describe, expect, it } from 'vitest';
import LibraryService from '../../src/services/library.service';

describe('library hardening contract shapes', () => {
  it('summarizes final import outcomes for the React import queue', () => {
    const summary = LibraryService.getInstance().createImportSummary([
      { inputName: 'a.png', status: 'accepted', message: 'Imported', metadataAvailable: false, thumbnailAvailable: true },
      { inputName: 'b.png', status: 'duplicate', message: 'Already in library', metadataAvailable: false, thumbnailAvailable: true },
      { inputName: 'c.txt', status: 'unsupported', message: 'Unsupported', metadataAvailable: false, thumbnailAvailable: false },
      { inputName: 'd.jpg', status: 'failed', message: 'Failed', metadataAvailable: false, thumbnailAvailable: false },
    ]);

    expect(summary).toMatchObject({
      total: 4,
      accepted: 1,
      duplicate: 1,
      unsupported: 1,
      failed: 1,
      completed: 4,
    });
  });
});
