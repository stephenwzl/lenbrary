import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('React UI static contract', () => {
  it('mounts React and keeps no-script fallback', () => {
    const html = readFileSync('src/ui/index.html', 'utf8');

    expect(html).toContain('id="root"');
    expect(html).toContain('/react/main.tsx');
    expect(html).toContain('noscript');
  });

  it('keeps liquid glass primitives in globals.css', () => {
    const css = readFileSync('src/ui/react/globals.css', 'utf8');

    // CSS variable theme tokens (Tailwind v4 @theme uses --color- prefix)
    expect(css).toContain('--color-card');
    expect(css).toContain('--color-border');
    expect(css).toContain('--color-ring');
    expect(css).toContain('--color-glass-border');

    // Glass panel class with backdrop filter
    expect(css).toContain('.glass-panel');
    expect(css).toContain('backdrop-filter');

    // Reduced-motion accessibility
    expect(css).toContain('prefers-reduced-motion');
  });
});
