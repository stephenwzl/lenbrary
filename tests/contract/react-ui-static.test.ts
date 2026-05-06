import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('React UI static contract', () => {
  it('mounts React and keeps no-script fallback', () => {
    const html = readFileSync('src/ui/index.html', 'utf8');

    expect(html).toContain('id="root"');
    expect(html).toContain('/react/main.tsx');
    expect(html).toContain('noscript');
  });

  it('keeps liquid glass primitives in the React stylesheet', () => {
    const css = readFileSync('src/ui/react/styles.css', 'utf8');

    expect(css).toContain('.glass-panel');
    expect(css).toContain('backdrop-filter');
    expect(css).toContain('prefers-reduced-motion');
  });
});
