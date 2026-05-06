import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import DatabaseService from '../../src/services/database.service';
import { startTestServer } from '../helpers/http';

describe('PUT /api/library/assets/:id/tags', () => {
  it('replaces tags with trimmed unique labels', async () => {
    const db = DatabaseService.getInstance();
    const asset = db.createAsset({
      original_name: 'tags.jpg',
      stored_name: 'tags.jpg',
      file_path: '/tmp/tags.jpg',
      mime_type: 'image/jpeg',
      file_type: 'image',
      file_size: 1,
      file_hash: `tags-${Date.now()}`,
      created_at: Date.now(),
    });
    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/api/library/assets/${asset.id}/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: [' family ', 'family', 'x100v'] }),
      });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.tags).toEqual(['family', 'x100v']);
    } finally {
      db.deleteAsset(asset.id!);
      await server.close();
    }
  });
});
