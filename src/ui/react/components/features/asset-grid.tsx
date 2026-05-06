import { Badge } from '@/components/ui/badge';
import type { BrowseGroup, MediaAssetView } from '../../types';

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

interface AssetGridProps {
  assets: MediaAssetView[];
  groups?: BrowseGroup[];
  groupBy: string;
  selectedIds: number[];
  loading: boolean;
  onSelect: (id: number) => void;
  onOpen: (id: number) => void;
}

export function AssetGrid({ assets, groups, groupBy, selectedIds, loading, onSelect, onOpen }: AssetGridProps) {
  const visibleAssets = groupBy === 'flat' ? assets : (groups || []).flatMap(group => group.assets);

  return (
    <section className="glass-panel p-3" data-testid="asset-results">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">{groupBy === 'flat' ? 'Assets' : 'Grouped Assets'}</h2>
        {loading ? (
          <span className="text-xs text-muted-foreground">Loading...</span>
        ) : (
          <span className="text-xs text-muted-foreground">{visibleAssets.length} shown</span>
        )}
      </div>

      {groupBy === 'flat' ? (
        <AssetGridView assets={assets} selectedIds={selectedIds} onSelect={onSelect} onOpen={onOpen} />
      ) : (
        (groups || []).map(group => (
          <section key={group.groupKey} className="mb-3">
            <h3 className="text-xs font-semibold mb-1">
              {group.label} <Badge variant="secondary" className="text-xs">{group.count}</Badge>
            </h3>
            <AssetGridView assets={group.assets} selectedIds={selectedIds} onSelect={onSelect} onOpen={onOpen} />
          </section>
        ))
      )}
    </section>
  );
}

function AssetGridView({ assets, selectedIds, onSelect, onOpen }: {
  assets: MediaAssetView[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  onOpen: (id: number) => void;
}) {
  if (assets.length === 0) {
    return <p className="text-xs text-muted-foreground">No assets match the current view.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {assets.map(asset => (
        <article
          key={asset.id}
          className={`glass-panel p-2 cursor-pointer ${selectedIds.includes(asset.id) ? 'ring-2 ring-[var(--color-ring)]' : ''}`}
        >
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={selectedIds.includes(asset.id)}
              onChange={() => onSelect(asset.id)}
              className="accent-[var(--color-ring)]"
            />
            <span>Select</span>
          </label>
          <button type="button" className="text-left w-full mt-1" onClick={() => onOpen(asset.id)}>
            {asset.thumbnailUrl ? (
              <img src={asset.thumbnailUrl} alt="" className="w-full aspect-video object-cover rounded" />
            ) : (
              <span className="text-xs text-muted-foreground flex items-center justify-center w-full aspect-video">
                No preview
              </span>
            )}
            <strong className="text-xs block mt-1 truncate">{asset.originalName}</strong>
            <span className="text-xs text-muted-foreground">{asset.mediaType} · {formatSize(asset.fileSize)}</span>
          </button>
        </article>
      ))}
    </div>
  );
}
