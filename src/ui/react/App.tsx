import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  batchDelete,
  batchFavorite,
  batchTags,
  getAsset,
  getHealth,
  importFiles,
  listAssets,
  replaceTags,
  setFavorite,
} from './api';
import type { BrowseGroup, FilterState, ImportQueueItem, ImportSummary, LibraryHealth, MediaAssetView } from './types';

const emptyFilters: FilterState = {
  type: '',
  favorite: '',
  tag: '',
  camera: '',
  dateFrom: '',
  dateTo: '',
  hasThumbnail: '',
  hasMetadata: '',
  groupBy: 'flat',
};

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

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

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
    status: 'queued',
    message: 'Queued',
    metadataAvailable: false,
    thumbnailAvailable: false,
  }));
}

export default function App() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [assets, setAssets] = useState<MediaAssetView[]>([]);
  const [groups, setGroups] = useState<BrowseGroup[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetView | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [importQueue, setImportQueue] = useState<ImportQueueItem[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummary>(emptySummary);
  const [health, setHealth] = useState<LibraryHealth | null>(null);
  const [feedback, setFeedback] = useState('Ready');
  const [loading, setLoading] = useState(false);
  const [batchTagsInput, setBatchTagsInput] = useState('');

  const visibleAssets = filters.groupBy === 'flat' ? assets : groups.flatMap(group => group.assets);
  const selectedCount = selectedIds.length;

  async function refreshLibrary(nextFilters = filters) {
    setLoading(true);
    try {
      const result = await listAssets(nextFilters);
      setAssets(result.assets);
      setGroups(result.groups || []);
      if (selectedAsset && ![...result.assets, ...(result.groups || []).flatMap(group => group.assets)].some(asset => asset.id === selectedAsset.id)) {
        setSelectedAsset(null);
      }
      setFeedback('Library loaded');
    } catch (error) {
      setFeedback(`Failed to load library: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  async function refreshHealth() {
    try {
      setHealth(await getHealth());
    } catch (error) {
      setFeedback(`Failed to load health: ${(error as Error).message}`);
    }
  }

  useEffect(() => {
    void refreshLibrary();
    void refreshHealth();
  }, []);

  async function handleImport(files: File[]) {
    if (files.length === 0) return;
    const queued = createInitialImportItems(files);
    setImportQueue(queued);
    setImportSummary(summarizeImport(queued));
    setFeedback(`Uploading ${files.length} files`);
    setImportQueue(queued.map(item => ({ ...item, status: 'uploading', message: 'Uploading' })));
    try {
      const result = await importFiles(files);
      setImportQueue(result.results);
      setImportSummary(result.summary || summarizeImport(result.results));
      setFeedback(`Import completed: ${result.results.length} files reviewed`);
      await refreshLibrary();
      await refreshHealth();
    } catch (error) {
      const failed = queued.map(item => ({ ...item, status: 'failed' as const, message: (error as Error).message || 'Import failed' }));
      setImportQueue(failed);
      setImportSummary(summarizeImport(failed));
      setFeedback(`Import failed: ${(error as Error).message}`);
    }
  }

  function updateFilter(key: keyof FilterState, value: string) {
    const next = { ...filters, [key]: value } as FilterState;
    setFilters(next);
    void refreshLibrary(next);
  }

  async function openDetail(id: number) {
    try {
      setSelectedAsset(await getAsset(id));
    } catch (error) {
      setFeedback(`Failed to load detail: ${(error as Error).message}`);
    }
  }

  function toggleSelection(id: number) {
    setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  async function handleFavorite(asset: MediaAssetView) {
    await setFavorite(asset.id, !asset.favorite);
    setFeedback(asset.favorite ? 'Favorite removed' : 'Favorite added');
    await refreshLibrary();
  }

  async function handleTags(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAsset) return;
    const form = new FormData(event.currentTarget);
    const tagValue = form.get('tags');
    const tags = (typeof tagValue === 'string' ? tagValue : '').split(',').map(tag => tag.trim()).filter(Boolean);
    await replaceTags(selectedAsset.id, tags);
    setFeedback('Tags updated');
    await refreshLibrary();
    await openDetail(selectedAsset.id);
  }

  async function runBatchTags() {
    const tags = batchTagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
    const result = await batchTags(selectedIds, tags);
    setFeedback(result.message);
    await refreshLibrary();
  }

  async function runBatchFavorite(favorite: boolean) {
    const result = await batchFavorite(selectedIds, favorite);
    setFeedback(result.message);
    await refreshLibrary();
  }

  async function runBatchDelete() {
    if (!window.confirm(`Delete ${selectedCount} selected assets?`)) return;
    const result = await batchDelete(selectedIds);
    setFeedback(result.message);
    setSelectedIds([]);
    setSelectedAsset(null);
    await refreshLibrary();
    await refreshHealth();
  }

  const importRows = importQueue.length > 0 ? importQueue : [];
  const activeFilterCount = useMemo(() => Object.entries(filters).filter(([key, value]) => key !== 'groupBy' && value).length, [filters]);

  return (
    <main className="app-shell">
      <header className="toolbar glass-panel">
        <div>
          <p className="eyebrow">Personal Media Library</p>
          <h1>Lenbrary</h1>
        </div>
        <div className="toolbar-actions">
          <button type="button" onClick={() => refreshLibrary()} aria-label="Refresh library">Refresh</button>
          <a className="button" href="/api/library/export" onClick={() => setFeedback('Summary export excludes original media files')}>Export Summary</a>
        </div>
      </header>

      <section className="feedback glass-panel" role="status" aria-live="polite" data-testid="feedback-region">
        {feedback}
      </section>

      <section className="workspace">
        <aside className="sidebar glass-panel">
          <label className="file-drop">
            <span>Import media</span>
            <input
              data-testid="file-input"
              type="file"
              multiple
              onChange={event => handleImport(Array.from(event.target.files || []))}
            />
          </label>

          <div className="filters" aria-label="Library filters">
            <select aria-label="Media type" value={filters.type} onChange={event => updateFilter('type', event.target.value)}>
              <option value="">All media</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
            <select aria-label="Favorite filter" value={filters.favorite} onChange={event => updateFilter('favorite', event.target.value)}>
              <option value="">Any favorite state</option>
              <option value="true">Favorites</option>
              <option value="false">Not favorites</option>
            </select>
            <input aria-label="Tag filter" placeholder="Tag" value={filters.tag} onChange={event => updateFilter('tag', event.target.value)} />
            <input aria-label="Camera filter" placeholder="Camera" value={filters.camera} onChange={event => updateFilter('camera', event.target.value)} />
            <input aria-label="Date from" type="date" value={filters.dateFrom} onChange={event => updateFilter('dateFrom', event.target.value)} />
            <input aria-label="Date to" type="date" value={filters.dateTo} onChange={event => updateFilter('dateTo', event.target.value)} />
            <select aria-label="Thumbnail filter" value={filters.hasThumbnail} onChange={event => updateFilter('hasThumbnail', event.target.value)}>
              <option value="">Any thumbnail</option>
              <option value="true">Has thumbnail</option>
              <option value="false">Missing thumbnail</option>
            </select>
            <select aria-label="Metadata filter" value={filters.hasMetadata} onChange={event => updateFilter('hasMetadata', event.target.value)}>
              <option value="">Any metadata</option>
              <option value="true">Has metadata</option>
              <option value="false">Missing metadata</option>
            </select>
            <select aria-label="Grouping mode" value={filters.groupBy} onChange={event => updateFilter('groupBy', event.target.value)}>
              <option value="flat">Flat</option>
              <option value="timeline">Timeline</option>
              <option value="tag">Tag</option>
              <option value="camera">Camera</option>
            </select>
            <button type="button" onClick={() => { setFilters(emptyFilters); void refreshLibrary(emptyFilters); }}>Clear filters ({activeFilterCount})</button>
          </div>

          <div className="health" data-testid="health-panel">
            <h2>Health</h2>
            {health ? (
              <>
                <p>{health.assetCounts.total} assets · {health.issueCounts.missingOriginals} missing originals</p>
                {(health.issues || []).map(issue => (
                  <div className={`issue ${issue.severity}`} key={`${issue.issueType}-${issue.summary}`}>
                    <strong>{issue.summary}</strong>
                    <span>{issue.recommendedAction}</span>
                  </div>
                ))}
              </>
            ) : <p>No health check yet.</p>}
          </div>
        </aside>

        <section className="content">
          <section className="import-queue glass-panel" data-testid="import-queue">
            <div className="section-heading">
              <h2>Import Queue</h2>
              <span>{importSummary.completed}/{importSummary.total} completed</span>
            </div>
            <div className="summary-strip">
              <span>Accepted {importSummary.accepted}</span>
              <span>Duplicate {importSummary.duplicate}</span>
              <span>Unsupported {importSummary.unsupported}</span>
              <span>Failed {importSummary.failed}</span>
            </div>
            {importRows.length === 0 ? <p className="muted">No imports in this session.</p> : importRows.map(item => (
              <div className={`queue-row ${item.status}`} key={`${item.inputName}-${item.status}`}>
                <strong>{item.inputName}</strong>
                <span>{item.status}</span>
                <small>{item.message}</small>
                {item.assetId ? <button type="button" onClick={() => openDetail(item.assetId!)}>Open</button> : null}
              </div>
            ))}
          </section>

          <section className="batch-toolbar glass-panel" aria-label="Batch actions">
            <strong>{selectedCount} selected</strong>
            <input value={batchTagsInput} placeholder="Batch tags" onChange={event => setBatchTagsInput(event.target.value)} />
            <button type="button" disabled={selectedCount === 0} onClick={runBatchTags}>Tag</button>
            <button type="button" disabled={selectedCount === 0} onClick={() => runBatchFavorite(true)}>Favorite</button>
            <button type="button" disabled={selectedCount === 0} onClick={() => runBatchFavorite(false)}>Unfavorite</button>
            <button type="button" disabled={selectedCount === 0} className="danger" onClick={runBatchDelete}>Delete</button>
          </section>

          <section className="library glass-panel" data-testid="asset-results">
            <div className="section-heading">
              <h2>{filters.groupBy === 'flat' ? 'Assets' : 'Grouped Assets'}</h2>
              {loading ? <span>Loading...</span> : <span>{visibleAssets.length} shown</span>}
            </div>
            {filters.groupBy === 'flat' ? (
              <AssetGrid assets={assets} selectedIds={selectedIds} onSelect={toggleSelection} onOpen={openDetail} />
            ) : (
              groups.map(group => (
                <section className="asset-group" key={group.groupKey}>
                  <h3>{group.label} <span>{group.count}</span></h3>
                  <AssetGrid assets={group.assets} selectedIds={selectedIds} onSelect={toggleSelection} onOpen={openDetail} />
                </section>
              ))
            )}
          </section>
        </section>

        <aside className="detail glass-panel" data-testid="asset-detail">
          <h2>Detail</h2>
          {selectedAsset ? (
            <>
              <h3>{selectedAsset.originalName}</h3>
              <p>{selectedAsset.mediaType} · {formatSize(selectedAsset.fileSize)}</p>
              <p>{selectedAsset.metadataAvailable ? 'Metadata available' : 'Missing metadata'} · {selectedAsset.thumbnailAvailable ? 'Thumbnail available' : 'Missing thumbnail'}</p>
              <p>{selectedAsset.fileAvailable ? 'Original available' : 'Missing original'}</p>
              <div className="chips">{selectedAsset.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
              <button type="button" onClick={() => handleFavorite(selectedAsset)}>{selectedAsset.favorite ? 'Unfavorite' : 'Favorite'}</button>
              <form onSubmit={handleTags}>
                <input name="tags" aria-label="Asset tags" defaultValue={selectedAsset.tags.join(', ')} />
                <button type="submit">Save tags</button>
              </form>
              <a className="button" href={selectedAsset.fileUrl}>Open original</a>
            </>
          ) : <p className="muted">Select an asset to inspect metadata, original access, and organization.</p>}
        </aside>
      </section>
    </main>
  );
}

function AssetGrid({ assets, selectedIds, onSelect, onOpen }: {
  assets: MediaAssetView[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  onOpen: (id: number) => void;
}) {
  if (assets.length === 0) {
    return <p className="muted">No assets match the current view.</p>;
  }
  return (
    <div className="asset-grid">
      {assets.map(asset => (
        <article className={`asset-card ${selectedIds.includes(asset.id) ? 'selected' : ''}`} key={asset.id}>
          <label className="select-box">
            <input type="checkbox" checked={selectedIds.includes(asset.id)} onChange={() => onSelect(asset.id)} />
            <span>Select</span>
          </label>
          <button type="button" className="asset-open" onClick={() => onOpen(asset.id)}>
            {asset.thumbnailUrl ? <img src={asset.thumbnailUrl} alt="" /> : <span className="no-thumb">No preview</span>}
            <strong>{asset.originalName}</strong>
            <span>{asset.mediaType} · {formatSize(asset.fileSize)}</span>
          </button>
        </article>
      ))}
    </div>
  );
}
