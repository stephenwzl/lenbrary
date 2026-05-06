import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
);

export interface MediaFixtureSet {
  root: string;
  png: string;
  duplicatePng: string;
  unsupported: string;
  damaged: string;
  zeroByte: string;
  largerUnsupported: string;
}

export function createMediaFixtureSet(): MediaFixtureSet {
  const root = mkdtempSync(join(tmpdir(), 'lenbrary-media-'));
  const png = join(root, 'sample.png');
  const duplicatePng = join(root, 'sample-copy.png');
  const unsupported = join(root, 'notes.txt');
  const damaged = join(root, 'damaged.png');
  const zeroByte = join(root, 'empty.jpg');
  const largerUnsupported = join(root, 'large.bin');

  writeFileSync(png, PNG_BYTES);
  writeFileSync(duplicatePng, PNG_BYTES);
  writeFileSync(unsupported, 'not media');
  writeFileSync(damaged, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00]));
  writeFileSync(zeroByte, Buffer.alloc(0));
  writeFileSync(largerUnsupported, Buffer.alloc(1024 * 128, 7));

  return { root, png, duplicatePng, unsupported, damaged, zeroByte, largerUnsupported };
}
