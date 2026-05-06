import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { startTestServer } from '../helpers/http';

describe('frontend control surface support', () => {
  it('serves the enhanced page and API-backed filtered listing', async () => {
    const server = await startTestServer(createApp());
    try {
      const page = await fetch(`${server.baseUrl}/`);
      const listing = await fetch(`${server.baseUrl}/api/library/assets?limit=3&offset=0&favorite=false&hasThumbnail=true`);
      const body = await listing.json();

      expect(page.status).toBe(200);
      expect(await page.text()).toContain('id="root"');
      expect(listing.status).toBe(200);
      expect(body.pagination).toMatchObject({ limit: 3, offset: 0 });
    } finally {
      await server.close();
    }
  });
});
