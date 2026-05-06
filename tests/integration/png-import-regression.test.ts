import { readFileSync, rmSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import createApp from '../../src/app';
import { createMediaFixtureSet, type MediaFixtureSet } from '../helpers/media-fixtures';
import { startTestServer, type TestServer } from '../helpers/http';
import { createTestEnv, type TestEnv } from '../helpers/test-env';

describe('PNG import regression', () => {
  let env: TestEnv;
  let server: TestServer;
  let fixtures: MediaFixtureSet;

  beforeEach(async () => {
    env = createTestEnv();
    fixtures = createMediaFixtureSet();
    server = await startTestServer(createApp());
  });

  afterEach(async () => {
    await server.close();
    rmSync(fixtures.root, { recursive: true, force: true });
    env.cleanup();
  });

  it('imports a PNG through the library import endpoint', async () => {
    const form = new FormData();
    form.append('files', new Blob([readFileSync(fixtures.png)], { type: 'image/png' }), 'sample.png');

    const response = await fetch(`${server.baseUrl}/api/library/import`, { method: 'POST', body: form });
    const body = await response.json() as any;

    expect(response.status).toBe(200);
    expect(body.data.results[0]).toMatchObject({
      inputName: 'sample.png',
      mediaType: 'image',
    });
    expect(['accepted', 'duplicate']).toContain(body.data.results[0].status);
  });
});
