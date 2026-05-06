import { Toaster as Sonner } from 'sonner';

import { cn } from '@/lib/utils';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className={cn('toaster group')}
      toastOptions={{
        classNames: {
          toast:
            'glass-panel border-glass-border text-foreground group toast group-[.toaster]:',
          description: 'text-muted-foreground',
          actionButton:
            'bg-primary text-primary-foreground',
          cancelButton:
            'bg-muted text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
