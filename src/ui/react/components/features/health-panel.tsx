import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { LibraryHealth, Severity } from '../../types';

/** Map severity to Badge variant */
const SEVERITY_VARIANT: Record<Severity, 'destructive' | 'warning' | 'secondary'> = {
  critical: 'destructive',
  warning: 'warning',
  info: 'secondary',
};

interface HealthPanelProps {
  health: LibraryHealth | null;
}

export function HealthPanel({ health }: HealthPanelProps) {
  if (!health) {
    return (
      <div data-testid="health-panel">
        <h2 className="text-sm font-semibold mb-1">Health</h2>
        <p className="text-xs text-muted-foreground">No health check yet.</p>
      </div>
    );
  }

  const totalAssets = health.assetCounts.total;
  const affectedCount = health.issueCounts.missingThumbnails + health.issueCounts.missingMetadata + health.issueCounts.missingOriginals;
  const healthyRatio = totalAssets > 0 ? Math.round(((totalAssets - affectedCount) / totalAssets) * 100) : 100;

  return (
    <div data-testid="health-panel">
      <h2 className="text-sm font-semibold mb-1">Health</h2>

      {/* Summary */}
      <p className="text-xs text-muted-foreground mb-1">
        {totalAssets} assets · {health.issueCounts.missingOriginals} missing originals
      </p>

      {/* Health progress bar */}
      <Progress value={healthyRatio} className="h-1.5 mb-2" />
      <p className="text-xs text-muted-foreground mb-2">{healthyRatio}% healthy</p>

      {/* Issue cards */}
      {(health.issues || []).map(issue => (
        <div
          key={`${issue.issueType}-${issue.summary}`}
          className="glass-panel p-2 mb-1.5"
        >
          <div className="flex items-center gap-2 mb-0.5">
            <Badge variant={SEVERITY_VARIANT[issue.severity]} className="text-xs">
              {issue.severity}
            </Badge>
            <span className="text-xs font-medium">{issue.summary}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {issue.affectedAssetIds.length} affected · {issue.recommendedAction}
          </p>
        </div>
      ))}
    </div>
  );
}
