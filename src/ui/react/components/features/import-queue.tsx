import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Loader2,
  CheckCircle2,
  Copy,
  AlertTriangle,
  XCircle,
  Upload,
} from 'lucide-react';
import type { ImportQueueItem, ImportStatus, ImportSummary } from '../../types';

/** Lucide icon + status color for each ImportStatus */
const STATUS_CONFIG: Record<ImportStatus, { icon: typeof Clock; color: string }> = {
  queued: { icon: Clock, color: 'text-muted-foreground' },
  uploading: { icon: Loader2, color: 'text-status-info' },
  accepted: { icon: CheckCircle2, color: 'text-status-success' },
  duplicate: { icon: Copy, color: 'text-status-warning' },
  unsupported: { icon: AlertTriangle, color: 'text-status-warning' },
  failed: { icon: XCircle, color: 'text-status-danger' },
  completed: { icon: CheckCircle2, color: 'text-status-success' },
  'processing-pending': { icon: Loader2, color: 'text-status-info' },
};

interface ImportQueueProps {
  queue: ImportQueueItem[];
  summary: ImportSummary;
  importing: boolean;
  onImport: (files: File[]) => void;
  onOpenAsset: (id: number) => void;
}

export function ImportQueue({ queue, summary, importing, onImport, onOpenAsset }: ImportQueueProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completionPercent = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;

  return (
    <section className="glass-panel p-3" data-testid="import-queue">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Import Queue</h2>
        <span className="text-xs text-muted-foreground">
          {summary.completed}/{summary.total} completed
        </span>
      </div>

      {/* Import button with Upload icon */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={event => onImport(Array.from(event.target.files || []))}
      />
      <Button
        variant="outline"
        size="sm"
        className="mb-2"
        disabled={importing}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-1" />
        {importing ? 'Importing...' : 'Import media'}
      </Button>

      {/* Import summary counters with status-colored Badges */}
      {summary.total > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="success" className="text-xs">Accepted {summary.accepted}</Badge>
          <Badge variant="secondary" className="text-xs">Duplicate {summary.duplicate}</Badge>
          <Badge variant="warning" className="text-xs">Unsupported {summary.unsupported}</Badge>
          <Badge variant="destructive" className="text-xs">Failed {summary.failed}</Badge>
        </div>
      )}

      {/* Overall progress bar */}
      {summary.total > 0 && (
        <Progress value={completionPercent} className="mb-2 h-1.5" />
      )}

      {/* Queue items */}
      {queue.length === 0 ? (
        <p className="text-xs text-muted-foreground">No imports in this session.</p>
      ) : (
        queue.map(item => {
          const config = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.queued;
          const StatusIcon = config.icon;

          return (
            <div key={`${item.inputName}-${item.status}`} className="flex items-start gap-2 py-1.5">
              <StatusIcon className={`h-4 w-4 mt-0.5 shrink-0 ${config.color} ${item.status === 'uploading' || item.status === 'processing-pending' ? 'animate-spin' : ''}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium truncate">{item.inputName}</span>
                  <Badge
                    variant={item.status === 'failed' ? 'destructive' : item.status === 'accepted' ? 'success' : 'secondary'}
                    className="text-xs shrink-0"
                  >
                    {item.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{item.message}</span>

                {/* Failure detail with next-action guidance */}
                {item.status === 'failed' && item.nextAction && (
                  <p className="text-xs text-status-danger mt-0.5">
                    Suggested action: {item.nextAction}
                  </p>
                )}

                {/* Progress indicator for uploading items */}
                {item.status === 'uploading' && (
                  <Progress value={undefined} className="mt-1 h-1" />
                )}

                {/* Link to open accepted/duplicate asset */}
                {item.assetId ? (
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => onOpenAsset(item.assetId!)}>
                    View asset
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
