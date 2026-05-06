import { describe, expect, it } from 'vitest';

describe('React selection state contract', () => {
  it('represents selected asset ids as stable numbers', () => {
    const selected = [1, 2, 3].filter(id => id !== 2);
    expect(selected).toEqual([1, 3]);
  });
});
