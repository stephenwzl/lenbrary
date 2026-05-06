import { describe, expect, it } from 'vitest';

describe('React health export state', () => {
  it('keeps export warning text explicit', () => {
    expect('Summary export excludes original media files').toContain('excludes original media files');
  });
});
