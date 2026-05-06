import { describe, expect, it } from 'vitest';
import { createInitialImportItems } from '@/hooks/use-import';

describe('React import state helpers', () => {
  it('creates queued rows for selected files', () => {
    const file = new File(['x'], 'sample.png', { type: 'image/png' });

    expect(createInitialImportItems([file])).toEqual([
      {
        inputName: 'sample.png',
        status: 'queued',
        message: 'Queued',
        metadataAvailable: false,
        thumbnailAvailable: false,
      },
    ]);
  });
});
