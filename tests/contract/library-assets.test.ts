import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { startTestServer } from '../helpers/http';

describe('GET /api/library/assets', () => {
  it('returns a library asset collection response', async () => {
    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/api/library/assets?limit=5&type=image`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination).toMatchObject({ limit: 5, offset: 0 });
    } finally {
      await server.close();
    }
  });

  it('accepts pagination and extended frontend filter parameters', async () => {
    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/api/library/assets?limit=2&offset=1&type=image&favorite=false&camera=sony&tag=travel&hasThumbnail=true&hasMetadata=false`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination).toMatchObject({ limit: 2, offset: 1 });
      expect(typeof body.pagination.hasMore).toBe('boolean');
    } finally {
      await server.close();
    }
  });
});
