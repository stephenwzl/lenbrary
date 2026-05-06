import { useState } from 'react';
import { importFiles } from '../api';
import type { ImportQueueItem, ImportSummary } from '../types';

const emptySummary: ImportSummary = {
  total: 0,
  queued: 0,
  uploading: 0,
  accepted: 0,
  duplicate: 0,
  unsupported: 0,
  failed: 0,
  completed: 0,
};

function summarizeImport(items: ImportQueueItem[]): ImportSummary {
  return items.reduce<ImportSummary>((summary, item) => {
    summary.total += 1;
    if (item.status in summary) {
      summary[item.status as keyof ImportSummary] += 1;
    }
    if (['accepted', 'duplicate', 'unsupported', 'failed', 'completed'].includes(item.status)) {
      summary.completed += 1;
    }
    return summary;
  }, { ...emptySummary });
}

export function createInitialImportItems(files: File[]): ImportQueueItem[] {
  return files.map(file => ({
    inputName: file.name,
    status: 'queued' as const,
    message: 'Queued',
    metadataAvailable: false,
    thumbnailAvailable: false,
  }));
}

export function useImport() {
  const [importQueue, setImportQueue] = useState<ImportQueueItem[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummary>(emptySummary);
  const [importing, setImporting] = useState(false);

  async function handleImport(files: File[]) {
    if (files.length === 0) return;
    setImporting(true);
    const queued = createInitialImportItems(files);
    setImportQueue(queued);
    setImportSummary(summarizeImport(queued));
    setImportQueue(queued.map(item => ({ ...item, status: 'uploading' as const, message: 'Uploading' })));
    try {
      const result = await importFiles(files);
      setImportQueue(result.results);
      setImportSummary(result.summary || summarizeImport(result.results));
    } catch (err) {
      const failed = queued.map(item => ({
        ...item,
        status: 'failed' as const,
        message: (err as Error).message || 'Import failed',
      }));
      setImportQueue(failed);
      setImportSummary(summarizeImport(failed));
    } finally {
      setImporting(false);
    }
  }

  return { importQueue, importSummary, importing, handleImport };
}
