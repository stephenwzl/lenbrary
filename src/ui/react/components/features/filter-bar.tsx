import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { X, Tag, CalendarIcon } from 'lucide-react';
import type { FilterState } from '../../types';

interface FilterBarProps {
  filters: FilterState;
  activeFilterCount: number;
  availableTags: string[];
  updateFilter: (key: keyof FilterState, value: string) => void;
  clearFilters: () => void;
}

/** Label map for active filter display */
const FILTER_LABELS: Record<string, string> = {
  type: 'Type',
  favorite: 'Favorite',
  tag: 'Tag',
  camera: 'Camera',
  dateFrom: 'From',
  dateTo: 'To',
  hasThumbnail: 'Thumbnail',
  hasMetadata: 'Metadata',
};

export function FilterBar({ filters, activeFilterCount, availableTags, updateFilter, clearFilters }: FilterBarProps) {
  const [tagOpen, setTagOpen] = useState(false);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  // Collect active filters as chips (excluding groupBy)
  const activeChips = Object.entries(filters)
    .filter(([key, value]) => key !== 'groupBy' && value)
    .map(([key, value]) => ({ key: key as keyof FilterState, label: FILTER_LABELS[key] || key, value }));

  return (
    <div className="grid gap-2" aria-label="Library filters">
      {/* Media type select */}
      <Select value={filters.type || '__all__'} onValueChange={v => updateFilter('type', v === '__all__' ? '' : v)}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder="All media" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All media</SelectItem>
          <SelectItem value="image">Images</SelectItem>
          <SelectItem value="video">Videos</SelectItem>
        </SelectContent>
      </Select>

      {/* Favorite select */}
      <Select value={filters.favorite || '__all__'} onValueChange={v => updateFilter('favorite', v === '__all__' ? '' : v)}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder="Any favorite state" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Any favorite state</SelectItem>
          <SelectItem value="true">Favorites</SelectItem>
          <SelectItem value="false">Not favorites</SelectItem>
        </SelectContent>
      </Select>

      {/* Tag autocomplete with Popover + Command */}
      <Popover open={tagOpen} onOpenChange={setTagOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 justify-start text-sm font-normal">
            <Tag className="h-4 w-4 mr-1" />
            {filters.tag || 'Filter by tag'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[200px]" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." value={filters.tag} onValueChange={v => updateFilter('tag', v)} />
            <CommandList>
              <CommandEmpty>
                {availableTags.length === 0 ? (
                  <div className="flex flex-col items-center py-4">
                    <Tag className="h-6 w-6 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">No tags yet</p>
                  </div>
                ) : (
                  'No matching tags'
                )}
              </CommandEmpty>
              <CommandGroup>
                {availableTags
                  .filter(tag => !filters.tag || tag.toLowerCase().includes(filters.tag.toLowerCase()))
                  .map(tag => (
                    <CommandItem
                      key={tag}
                      value={tag}
                      onSelect={() => {
                        updateFilter('tag', tag);
                        setTagOpen(false);
                      }}
                    >
                      {tag}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Camera filter — plain text input (no autocomplete source available) */}
      <Input
        aria-label="Camera filter"
        placeholder="Camera"
        value={filters.camera}
        onChange={event => updateFilter('camera', event.target.value)}
        className="h-9 text-sm"
      />

      {/* Date from with Popover + Calendar */}
      <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 justify-start text-sm font-normal">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {filters.dateFrom || 'Date from'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
            onSelect={date => {
              updateFilter('dateFrom', date ? date.toISOString().split('T')[0] : '');
              setDateFromOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      {/* Date to with Popover + Calendar */}
      <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 justify-start text-sm font-normal">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {filters.dateTo || 'Date to'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
            onSelect={date => {
              updateFilter('dateTo', date ? date.toISOString().split('T')[0] : '');
              setDateToOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      {/* Thumbnail select */}
      <Select value={filters.hasThumbnail || '__all__'} onValueChange={v => updateFilter('hasThumbnail', v === '__all__' ? '' : v)}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder="Any thumbnail" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Any thumbnail</SelectItem>
          <SelectItem value="true">Has thumbnail</SelectItem>
          <SelectItem value="false">Missing thumbnail</SelectItem>
        </SelectContent>
      </Select>

      {/* Metadata select */}
      <Select value={filters.hasMetadata || '__all__'} onValueChange={v => updateFilter('hasMetadata', v === '__all__' ? '' : v)}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder="Any metadata" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Any metadata</SelectItem>
          <SelectItem value="true">Has metadata</SelectItem>
          <SelectItem value="false">Missing metadata</SelectItem>
        </SelectContent>
      </Select>

      {/* Grouping mode select */}
      <Select value={filters.groupBy} onValueChange={v => updateFilter('groupBy', v)}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder="Grouping" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="flat">Flat</SelectItem>
          <SelectItem value="timeline">Timeline</SelectItem>
          <SelectItem value="tag">Tag</SelectItem>
          <SelectItem value="camera">Camera</SelectItem>
        </SelectContent>
      </Select>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {activeChips.map(({ key, label, value }) => (
            <Badge key={key} variant="secondary" className="text-xs gap-1 pr-1">
              {label}: {value}
              <button
                type="button"
                className="ml-0.5 hover:text-destructive"
                onClick={() => updateFilter(key, key === 'groupBy' ? 'flat' : '')}
                aria-label={`Remove ${label} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-5 text-xs px-1" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Clear filters button (always visible) */}
      <Button variant="outline" size="sm" onClick={clearFilters}>
        Clear filters ({activeFilterCount})
      </Button>
    </div>
  );
}
