import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import DatabaseService from '../../src/services/database.service';
import { startTestServer } from '../helpers/http';

describe('organization markers workflow', () => {
  it('persists favorite and tags and returns them in library listing', async () => {
    const db = DatabaseService.getInstance();
    const asset = db.createAsset({
      original_name: 'organized.jpg',
      stored_name: 'organized.jpg',
      file_path: '/tmp/organized.jpg',
      mime_type: 'image/jpeg',
      file_type: 'image',
      file_size: 1,
      file_hash: `organized-${Date.now()}`,
      created_at: Date.now(),
    });
    db.setFavorite(asset.id!, true);
    db.replaceTags(asset.id!, ['portfolio']);
    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/api/library/assets?favorite=true&tag=portfolio`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.some((row: any) => row.id === asset.id && row.favorite && row.tags.includes('portfolio'))).toBe(true);
    } finally {
      db.deleteAsset(asset.id!);
      await server.close();
    }
  });
});
