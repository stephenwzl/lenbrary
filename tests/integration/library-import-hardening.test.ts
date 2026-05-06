import { readFileSync, rmSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import createApp from '../../src/app';
import { createMediaFixtureSet, type MediaFixtureSet } from '../helpers/media-fixtures';
import { startTestServer, type TestServer } from '../helpers/http';
import { createTestEnv, type TestEnv } from '../helpers/test-env';

describe('library import hardening', () => {
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

  it('returns final per-file outcomes for mixed imports without a generic 500', async () => {
    const form = new FormData();
    form.append('files', new Blob([readFileSync(fixtures.png)], { type: 'image/png' }), 'sample.png');
    form.append('files', new Blob([readFileSync(fixtures.duplicatePng)], { type: 'image/png' }), 'sample-copy.png');
    form.append('files', new Blob([readFileSync(fixtures.unsupported)], { type: 'text/plain' }), 'notes.txt');
    form.append('files', new Blob([readFileSync(fixtures.zeroByte)], { type: 'image/jpeg' }), 'empty.jpg');

    const response = await fetch(`${server.baseUrl}/api/library/import`, { method: 'POST', body: form });
    const body = await response.json() as any;

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.results).toHaveLength(4);
    expect(body.data.summary.completed).toBe(4);
    expect(body.data.results.map((item: any) => item.status).some((status: string) => status === 'accepted' || status === 'duplicate')).toBe(true);
    expect(body.data.results.map((item: any) => item.status)).toContain('duplicate');
    expect(body.data.results.map((item: any) => item.status)).toContain('unsupported');
  });
});
