import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentAreaProps {
  importQueue: ReactNode;
  batchToolbar: ReactNode;
  assetGrid: ReactNode;
  className?: string;
}

export function ContentArea({ importQueue, batchToolbar, assetGrid, className }: ContentAreaProps) {
  return (
    <section className={cn('grid gap-3', className)}>
      {importQueue}
      {batchToolbar}
      {assetGrid}
    </section>
  );
}
