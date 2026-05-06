import { AppShell } from '@/components/layout/app-shell';
import { Sidebar } from '@/components/layout/sidebar';
import { ContentArea } from '@/components/layout/content-area';
import { DetailPanel } from '@/components/layout/detail-panel';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/features/filter-bar';
import { ImportQueue } from '@/components/features/import-queue';
import { AssetGrid } from '@/components/features/asset-grid';
import { BatchToolbar } from '@/components/features/batch-toolbar';
import { HealthPanel } from '@/components/features/health-panel';
import { AssetDetail } from '@/components/features/asset-detail';
import { Toaster } from '@/components/ui/sonner';
import { useLibrary } from '@/hooks/use-library';
import { useImport } from '@/hooks/use-import';
import { useSelection } from '@/hooks/use-selection';
import { useFilters } from '@/hooks/use-filters';
import { useHealth } from '@/hooks/use-health';
import type { BrowseGroup, FilterState, MediaAssetView } from './types';

const initialFilters: FilterState = {
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

/** Extract unique tags from all assets (flat + grouped) for filter autocomplete */
function extractUniqueTags(assets: MediaAssetView[], groups: BrowseGroup[]): string[] {
  const allAssets = [...assets, ...groups.flatMap(g => g.assets)];
  const tagSet = new Set<string>();
  allAssets.forEach(asset => asset.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

export default function App() {
  // --- Hooks wiring ---
  const library = useLibrary(initialFilters);
  const healthHook = useHealth();
  const selection = useSelection(library.refreshLibrary, healthHook.refreshHealth);
  const filters = useFilters(library.refreshLibrary);
  const importHook = useImport();

  return (
    <>
      <AppShell
        header={
          <header className="glass-panel p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Personal Media Library</p>
              <h1 className="text-lg font-bold">Lenbrary</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => library.refreshLibrary()}>
                Refresh
              </Button>
              <a href="/api/library/export">
                <Button variant="outline" size="sm">Export Summary</Button>
              </a>
            </div>
          </header>
        }
        sidebar={
          <Sidebar
            importArea={
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Import media</span>
                <input
                  data-testid="file-input"
                  type="file"
                  multiple
                  className="text-sm"
                  onChange={event => importHook.handleImport(Array.from(event.target.files || []))}
                />
              </label>
            }
            filterArea={
              <FilterBar
                filters={filters.filters}
                activeFilterCount={filters.activeFilterCount}
                availableTags={extractUniqueTags(library.assets, library.groups)}
                updateFilter={filters.updateFilter}
                clearFilters={filters.clearFilters}
              />
            }
            healthArea={<HealthPanel health={healthHook.health} />}
          />
        }
        detail={
          <DetailPanel
            sheetOpen={selection.selectedAsset !== null}
            onSheetOpenChange={(open) => { if (!open) selection.closeDetail(); }}
          >
            <AssetDetail
              asset={selection.selectedAsset}
              allTags={extractUniqueTags(library.assets, library.groups)}
              onFavorite={selection.handleFavorite}
              onTags={selection.handleTags}
            />
          </DetailPanel>
        }
      >
        <ContentArea
          importQueue={
            <ImportQueue
              queue={importHook.importQueue}
              summary={importHook.importSummary}
              importing={importHook.importing}
              onImport={importHook.handleImport}
              onOpenAsset={selection.openDetail}
            />
          }
          batchToolbar={
            <BatchToolbar
              selectedCount={selection.selectedCount}
              operating={selection.operating}
              onBatchTags={selection.runBatchTags}
              onBatchFavorite={selection.runBatchFavorite}
              onBatchDelete={selection.runBatchDelete}
            />
          }
          assetGrid={
            <AssetGrid
              assets={library.assets}
              groups={library.groups}
              groupBy={filters.filters.groupBy}
              selectedIds={selection.selectedIds}
              loading={library.loading}
              onSelect={selection.toggleSelection}
              onOpen={selection.openDetail}
            />
          }
        />
      </AppShell>
      {/* aria-live region preserved for screen reader accessibility */}
      <div role="status" aria-live="polite" className="sr-only" data-testid="feedback-region" />
      <Toaster />
    </>
  );
}
