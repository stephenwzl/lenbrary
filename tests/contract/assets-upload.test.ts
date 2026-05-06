import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { startTestServer } from '../helpers/http';

describe('POST /api/assets/upload', () => {
  it('uploads a real PNG and returns an asset instead of crashing', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'lenbrary-png-upload-'));
    const pngPath = join(dir, 'upload.png');
    writeFileSync(
      pngPath,
      Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=', 'base64'),
    );
    const server = await startTestServer(createApp());

    try {
      const form = new FormData();
      form.append('file', new Blob([await import('node:fs').then(fs => fs.readFileSync(pngPath))], { type: 'image/png' }), 'upload.png');

      const response = await fetch(`${server.baseUrl}/api/assets/upload`, {
        method: 'POST',
        body: form,
      });
      const body = await response.json();

      expect([200, 201]).toContain(response.status);
      expect(body.success).toBe(true);
      expect(['accepted', 'duplicate']).toContain(body.importResult.status);
      expect(body.data.mime_type).toBe('image/png');
    } finally {
      await server.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
