import { describe, expect, it } from 'vitest';
import LibraryService from '../../src/services/library.service';

describe('LibraryService', () => {
  it('parses library filters from query values', () => {
    const service = LibraryService.getInstance();

    const filters = service.parseFilters({
      limit: '500',
      offset: '10',
      type: 'image',
      favorite: 'true',
      tag: ' family ',
      camera: 'Fuji',
      hasThumbnail: 'false',
      hasMetadata: 'true',
    });

    expect(filters).toMatchObject({
      limit: 200,
      offset: 10,
      type: 'image',
      favorite: true,
      tag: 'family',
      camera: 'Fuji',
      hasThumbnail: false,
      hasMetadata: true,
    });
  });
});
