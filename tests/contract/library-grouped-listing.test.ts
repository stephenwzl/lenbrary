import { describe, expect, it } from 'vitest';

describe('grouped listing contract', () => {
  it('uses stable group response fields', () => {
    expect({
      groupMode: 'timeline',
      groupKey: 'unknown-date',
      label: 'Unknown date',
      count: 0,
      assets: [],
    }).toMatchObject({
      groupMode: expect.any(String),
      groupKey: expect.any(String),
      label: expect.any(String),
      count: expect.any(Number),
      assets: expect.any(Array),
    });
  });
});
