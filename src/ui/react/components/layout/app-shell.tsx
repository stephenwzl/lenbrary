import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  header: ReactNode;
  children: ReactNode;
  sidebar: ReactNode;
  detail: ReactNode;
  className?: string;
}

export function AppShell({ header, children, sidebar, detail, className }: AppShellProps) {
  return (
    <main className={cn('w-full max-w-[1600px] mx-auto p-4 lg:p-[18px]', className)}>
      {header}
      {/* lg (1050px+): three-column sidebar | content | detail */}
      {/* md (680-1049px): content takes full width, sidebar/detail as Sheet */}
      {/* sm (<680px): compact single column */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,320px)_minmax(0,1fr)_minmax(280px,360px)] gap-3 lg:gap-[14px] items-start mt-3 lg:mt-[14px]">
        {sidebar}
        {children}
        {detail}
      </div>
    </main>
  );
}
