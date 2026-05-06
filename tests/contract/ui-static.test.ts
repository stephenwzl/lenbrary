import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const html = readFileSync(join(root, 'src/ui/index.html'), 'utf8');
const css = readFileSync(join(root, 'src/ui/styles.css'), 'utf8');
const app = readFileSync(join(root, 'src/ui/app.js'), 'utf8');

describe('static UI contract', () => {
  it('exposes the required personal library regions and controls', () => {
    [
      'feedbackRegion',
      'importResults',
      'importSummary',
      'activeFilters',
      'assetGrid',
      'detailPanel',
      'statusPanel',
      'exportButton',
      'loadMoreButton',
      'clearFiltersButton',
      'dateFromFilter',
      'dateToFilter',
      'thumbnailFilter',
      'metadataFilter',
    ].forEach(id => expect(html).toContain(`id="${id}"`));
  });

  it('contains import queue states and user-visible feedback rendering', () => {
    ['queued', 'uploading', 'accepted', 'duplicate', 'unsupported', 'failed'].forEach(status => {
      expect(app).toContain(status);
    });
    expect(app).toContain('showFeedback');
    expect(app).toContain('Original media files are not included');
  });

  it('defines liquid glass surfaces with responsive and accessible states', () => {
    expect(css).toContain('backdrop-filter');
    expect(css).toContain('.glass-panel');
    expect(css).toContain(':focus-visible');
    expect(css).toContain('prefers-reduced-motion');
    expect(css).toContain('@media (max-width: 640px)');
  });
});
