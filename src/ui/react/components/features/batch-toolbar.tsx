import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Tag, Star, StarOff, Trash2 } from 'lucide-react';
import type { BatchActionResult } from '../../types';

interface BatchToolbarProps {
  selectedCount: number;
  operating: boolean;
  onBatchTags: (tags: string[]) => Promise<BatchActionResult>;
  onBatchFavorite: (favorite: boolean) => Promise<BatchActionResult>;
  onBatchDelete: () => Promise<BatchActionResult>;
}

export function BatchToolbar({ selectedCount, operating, onBatchTags, onBatchFavorite, onBatchDelete }: BatchToolbarProps) {
  return (
    <section
      className={`glass-panel p-3 sticky bottom-3 z-10 transition-opacity ${selectedCount > 0 ? 'opacity-100' : 'opacity-60'}`}
      aria-label="Batch actions"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-xs">{selectedCount} selected</Badge>

        <BatchTagsInput
          disabled={selectedCount === 0 || operating}
          loading={operating}
          onSubmit={onBatchTags}
        />

        <Button
          size="sm"
          disabled={selectedCount === 0 || operating}
          onClick={async () => {
            const result = await onBatchFavorite(true);
            showBatchToast('Favorite', result);
          }}
        >
          {operating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Star className="h-4 w-4 mr-1" />}
          Favorite
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={selectedCount === 0 || operating}
          onClick={async () => {
            const result = await onBatchFavorite(false);
            showBatchToast('Unfavorite', result);
          }}
        >
          {operating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <StarOff className="h-4 w-4 mr-1" />}
          Unfavorite
        </Button>

        {/* Delete with AlertDialog confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              disabled={selectedCount === 0 || operating}
            >
              {operating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-panel">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {selectedCount} selected asset{selectedCount !== 1 ? 's' : ''}.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
                onClick={async () => {
                  const result = await onBatchDelete();
                  showBatchToast('Delete', result);
                }}
              >
                Delete {selectedCount} asset{selectedCount !== 1 ? 's' : ''}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}

/** Show Toast feedback for batch operations with partial-failure detail */
function showBatchToast(action: string, result: BatchActionResult) {
  const successCount = result.successes.length;
  const failureCount = result.failures.length;

  if (failureCount === 0) {
    toast.success(`${action}: ${successCount} asset${successCount !== 1 ? 's' : ''} updated`);
  } else if (successCount === 0) {
    toast.error(`${action} failed`, { description: `${failureCount} asset${failureCount !== 1 ? 's' : ''} could not be updated` });
  } else {
    toast.warning(`${action} partially completed`, {
      description: `${successCount} succeeded, ${failureCount} failed`,
    });
  }
}

function BatchTagsInput({ disabled, loading, onSubmit }: {
  disabled: boolean;
  loading: boolean;
  onSubmit: (tags: string[]) => Promise<BatchActionResult>;
}) {
  const [value, setValue] = useState('');

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const tags = value.split(',').map(t => t.trim()).filter(Boolean);
        if (tags.length > 0) {
          const result = await onSubmit(tags);
          showBatchToast('Tag', result);
          setValue('');
        }
      }}
      className="flex items-center gap-1"
    >
      <Input
        value={value}
        placeholder="Batch tags"
        className="max-w-[160px] h-8 text-sm"
        onChange={event => setValue(event.target.value)}
        disabled={disabled}
      />
      <Button type="submit" size="sm" disabled={disabled}>
        {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Tag className="h-4 w-4 mr-1" />}
        Tag
      </Button>
    </form>
  );
}
