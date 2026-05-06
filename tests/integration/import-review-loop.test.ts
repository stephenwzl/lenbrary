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
});
