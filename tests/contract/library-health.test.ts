import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { startTestServer } from '../helpers/http';

describe('GET /api/library/health', () => {
  it('returns library health counts and storage guidance', async () => {
    const server = await startTestServer(createApp());
    try {
      const response = await fetch(`${server.baseUrl}/api/library/health`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.assetCounts).toHaveProperty('total');
      expect(body.data.issueCounts).toHaveProperty('missingOriginals');
      expect(body.data.storageGuidance).toHaveProperty('database');
    } finally {
      await server.close();
    }
  });
});
