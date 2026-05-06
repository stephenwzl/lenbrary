import { describe, expect, it } from 'vitest';
import { createAcceptanceFailure } from '../acceptance/browser-harness';

describe('browser acceptance evidence', () => {
  it('captures step, expected state, actual state, and visible message', () => {
    expect(createAcceptanceFailure('import', 'accepted row', 'failed row', 'Failed to upload')).toEqual({
      step: 'import',
      expected: 'accepted row',
      actual: 'failed row',
      visibleMessage: 'Failed to upload',
    });
  });
});
