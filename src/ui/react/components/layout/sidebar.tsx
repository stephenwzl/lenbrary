import { useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter } from 'lucide-react';

interface SidebarProps {
  importArea: ReactNode;
  filterArea: ReactNode;
  healthArea: ReactNode;
  className?: string;
}

export function Sidebar({ importArea, filterArea, healthArea, className }: SidebarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const sidebarContent = (
    <div className="grid gap-3">
      {importArea}
      {filterArea}
      {healthArea}
    </div>
  );

  return (
    <>
      {/* Desktop: persistent aside (visible on lg+) */}
      <aside className={cn('glass-panel p-4 hidden lg:grid gap-3', className)}>
        {sidebarContent}
      </aside>

      {/* Mobile/Tablet: Sheet sidebar with filter icon trigger */}
      <div className="lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="mb-2">
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="glass-panel w-[85vw] max-w-[360px] p-4 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-sm font-semibold">Sidebar</SheetTitle>
            </SheetHeader>
            <div className="grid gap-3 mt-2">
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
