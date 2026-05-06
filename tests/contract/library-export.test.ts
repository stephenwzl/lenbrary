import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { startTestServer } from '../helpers/http';

describe('GET /api/library/export', () => {
  it('exports a catalog without media bytes', async () => {
    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/api/library/export`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.exclusions).toContain('Original media files are not included');
      expect(Array.isArray(body.assets)).toBe(true);
    } finally {
      await server.close();
    }
  });
});
