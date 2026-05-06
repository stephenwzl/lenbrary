import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import DatabaseService from '../../src/services/database.service';
import { startTestServer } from '../helpers/http';

describe('PUT /api/library/assets/:id/favorite', () => {
  it('sets favorite state', async () => {
    const db = DatabaseService.getInstance();
    const asset = db.createAsset({
      original_name: 'favorite.jpg',
      stored_name: 'favorite.jpg',
      file_path: '/tmp/favorite.jpg',
      mime_type: 'image/jpeg',
      file_type: 'image',
      file_size: 1,
      file_hash: `favorite-${Date.now()}`,
      created_at: Date.now(),
    });
    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/api/library/assets/${asset.id}/favorite`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: true }),
      });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual({ assetId: asset.id, favorite: true });
      expect(db.getFavorite(asset.id!)).toBe(true);
    } finally {
      db.deleteAsset(asset.id!);
      await server.close();
    }
  });
});
