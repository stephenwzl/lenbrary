import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { startTestServer } from '../helpers/http';

describe('frontend ergonomics support', () => {
  it('keeps health and export flows available for the page', async () => {
    const server = await startTestServer(createApp());
    try {
      const health = await fetch(`${server.baseUrl}/api/library/health`);
      const exportResponse = await fetch(`${server.baseUrl}/api/library/export`);
      const exportBody = await exportResponse.json();

      expect(health.status).toBe(200);
      expect(exportResponse.status).toBe(200);
      expect(exportBody.exclusions).toContain('Original media files are not included');
    } finally {
      await server.close();
    }
  });
});
