import { describe, expect, it } from 'vitest';
import LibraryService from '../../src/services/library.service';
import DatabaseService from '../../src/services/database.service';

describe('library health workflow', () => {
  it('detects missing original and missing derived data states', () => {
    const db = DatabaseService.getInstance();
    const asset = db.createAsset({
      original_name: 'missing.jpg',
      stored_name: 'missing.jpg',
      file_path: '/tmp/does-not-exist-lenbrary.jpg',
      mime_type: 'image/jpeg',
      file_type: 'image',
      file_size: 1,
      file_hash: `missing-${Date.now()}`,
      created_at: Date.now(),
    });
    try {
      const health = LibraryService.getInstance().getHealth();
      expect(health.issueCounts.missingOriginals).toBeGreaterThan(0);
      expect(health.issueCounts.missingMetadata).toBeGreaterThan(0);
    } finally {
      db.deleteAsset(asset.id!);
    }
  });
});
