import { describe, expect, it } from 'vitest';
import DatabaseService from '../../src/services/database.service';

describe('delete review loop cleanup', () => {
  it('removes organization state when deleting an asset', () => {
    const db = DatabaseService.getInstance();
    const asset = db.createAsset({
      original_name: 'delete.jpg',
      stored_name: 'delete.jpg',
      file_path: '/tmp/delete.jpg',
      mime_type: 'image/jpeg',
      file_type: 'image',
      file_size: 1,
      file_hash: `delete-${Date.now()}`,
      created_at: Date.now(),
    });
    db.setFavorite(asset.id!, true);
    db.replaceTags(asset.id!, ['trash']);

    db.deleteAsset(asset.id!);

    expect(db.getFavorite(asset.id!)).toBe(false);
    expect(db.getTags(asset.id!)).toEqual([]);
  });
});
