import { describe, expect, it } from 'vitest';
import DatabaseService from '../../src/services/database.service';

describe('DatabaseService library state', () => {
  it('stores favorites, tags, and import events', () => {
    const db = DatabaseService.getInstance();
    const asset = db.createAsset({
      original_name: 'test.jpg',
      stored_name: 'test.jpg',
      file_path: '/tmp/lenbrary-test.jpg',
      thumbnail_path: undefined,
      mime_type: 'image/jpeg',
      file_type: 'image',
      file_size: 10,
      width: undefined,
      height: undefined,
      file_hash: `test-${Date.now()}`,
      created_at: Date.now(),
    });
    const assetId = asset.id!;

    db.setFavorite(assetId, true);
    expect(db.getFavorite(assetId)).toBe(true);

    expect(db.replaceTags(assetId, [' family ', 'family', 'x100v', ''])).toEqual(['family', 'x100v']);
    expect(db.getTags(assetId)).toEqual(['family', 'x100v']);

    db.recordImportEvent({
      inputName: 'duplicate.jpg',
      status: 'duplicate',
      message: 'Already in library',
      metadataAvailable: false,
      thumbnailAvailable: false,
    });
    expect(db.countImportEventsByStatus('duplicate')).toBeGreaterThan(0);

    db.deleteAsset(assetId);
  });
});
