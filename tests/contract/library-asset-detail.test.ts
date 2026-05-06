import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import DatabaseService from '../../src/services/database.service';
import { startTestServer } from '../helpers/http';

describe('GET /api/library/assets/:id', () => {
  it('returns a detail view model for an asset', async () => {
    const db = DatabaseService.getInstance();
    const asset = db.createAsset({
      original_name: 'detail.jpg',
      stored_name: 'detail.jpg',
      file_path: '/tmp/detail.jpg',
      mime_type: 'image/jpeg',
      file_type: 'image',
      file_size: 1,
      file_hash: `detail-${Date.now()}`,
      created_at: Date.now(),
    });
    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/api/library/assets/${asset.id}`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toMatchObject({ id: asset.id, originalName: 'detail.jpg', mediaType: 'image' });
    } finally {
      db.deleteAsset(asset.id!);
      await server.close();
    }
  });
});
