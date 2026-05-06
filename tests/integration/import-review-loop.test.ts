import { describe, expect, it } from 'vitest';
import LibraryService from '../../src/services/library.service';

describe('import review loop outcome mapping', () => {
  it('maps upload response data to a user-visible import result', () => {
    const result = LibraryService.getInstance().getImportResultFromUpload('sample.jpg', {
      data: {
        id: 1,
        file_type: 'image',
        thumbnail_path: '/tmp/thumb.jpg',
        exif: { asset_id: 1 },
      },
    }, 'accepted');

    expect(result).toMatchObject({
      inputName: 'sample.jpg',
      status: 'accepted',
      assetId: 1,
      mediaType: 'image',
      metadataAvailable: true,
      thumbnailAvailable: true,
    });
  });

  it('keeps failed and unsupported outcomes distinguishable from successful imports', () => {
    const accepted = LibraryService.getInstance().getImportResultFromUpload('ok.png', {
      data: {
        id: 2,
        file_type: 'image',
        thumbnail_path: '/tmp/ok.jpg',
        exif: { asset_id: 2 },
      },
    }, 'accepted');
    const duplicate = LibraryService.getInstance().getImportResultFromUpload('ok-copy.png', {
      data: {
        id: 2,
        file_type: 'image',
      },
    }, 'duplicate');

    expect(accepted.status).toBe('accepted');
    expect(duplicate.status).toBe('duplicate');
    expect(duplicate.assetId).toBe(2);
    expect(duplicate.message).toBe('Already in library');
  });
});
