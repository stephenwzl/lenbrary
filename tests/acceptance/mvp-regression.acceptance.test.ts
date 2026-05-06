import { describe, expect, it } from 'vitest';
import { createAcceptanceFailure } from './browser-harness';

describe('MVP browser regression acceptance placeholder', () => {
  it('keeps the evidence contract executable', () => {
    expect(createAcceptanceFailure('mvp flow', 'passed', 'not run', 'pending full automation').visibleMessage).toContain('pending');
  });
});
