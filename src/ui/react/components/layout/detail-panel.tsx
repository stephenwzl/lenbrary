import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface DetailPanelProps {
  children: ReactNode;
  /** Whether the mobile sheet is open */
  sheetOpen?: boolean;
  /** Callback when sheet open state changes */
  onSheetOpenChange?: (open: boolean) => void;
  className?: string;
}

export function DetailPanel({ children, sheetOpen, onSheetOpenChange, className }: DetailPanelProps) {
  return (
    <>
      {/* Desktop: sticky aside panel (visible on lg+) */}
      <aside
        className={cn('glass-panel p-4 grid gap-3 lg:sticky lg:top-[18px] hidden lg:grid', className)}
        data-testid="asset-detail"
      >
        {children}
      </aside>

      {/* Mobile: Sheet drawer (visible below lg) */}
      <div className="lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={onSheetOpenChange}>
          <SheetContent side="right" className="glass-panel w-[85vw] max-w-[400px] p-4 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-sm font-semibold">Detail</SheetTitle>
            </SheetHeader>
            <div className="grid gap-3 mt-2" data-testid="asset-detail-mobile">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
