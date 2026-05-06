import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Star, Tag, ExternalLink } from 'lucide-react';
import type { AssetMetadataView, MediaAssetView } from '../../types';

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

interface AssetDetailProps {
  asset: MediaAssetView | null;
  allTags: string[];
  onFavorite: (asset: MediaAssetView) => void;
  onTags: (assetId: number, tags: string[]) => void;
}

export function AssetDetail({ asset, allTags, onFavorite, onTags }: AssetDetailProps) {
  if (!asset) {
    return (
      <>
        <h2 className="text-sm font-semibold">Detail</h2>
        <p className="text-xs text-muted-foreground">
          Select an asset to inspect metadata, original access, and organization.
        </p>
      </>
    );
  }

  return (
    <>
      <h2 className="text-sm font-semibold">Detail</h2>

      {/* Basic info */}
      <h3 className="text-sm font-medium">{asset.originalName}</h3>
      <p className="text-xs text-muted-foreground">{asset.mediaType} · {formatSize(asset.fileSize)}</p>
      <p className="text-xs text-muted-foreground">
        {asset.metadataAvailable ? 'Metadata available' : 'Missing metadata'} · {asset.thumbnailAvailable ? 'Thumbnail available' : 'Missing thumbnail'}
      </p>
      <p className="text-xs text-muted-foreground">
        {asset.fileAvailable ? 'Original available' : 'Missing original'}
      </p>

      {/* Tags with autocomplete editing */}
      <div className="mt-2">
        <TagEditor tags={asset.tags} allTags={allTags} onSave={tags => onTags(asset.id, tags)} />
      </div>

      <Separator className="my-2" />

      {/* Favorite toggle with animated icon */}
      <Button
        size="sm"
        variant="outline"
        className="transition-all duration-200"
        onClick={() => onFavorite(asset)}
      >
        <Star className={`h-4 w-4 mr-1 transition-all duration-200 ${asset.favorite ? 'fill-yellow-400 text-yellow-400 scale-110' : ''}`} />
        {asset.favorite ? 'Unfavorite' : 'Favorite'}
      </Button>

      {/* Metadata in Accordion sections */}
      {asset.metadata && (
        <MetadataAccordion metadata={asset.metadata} />
      )}

      {/* Export original link with tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
              href={asset.fileUrl}
            >
              <ExternalLink className="h-3 w-3" />
              Open original
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export summary excludes original media files</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}

/** Tag editor with Popover + Command autocomplete */
function TagEditor({ tags, allTags, onSave }: { tags: string[]; allTags: string[]; onSave: (tags: string[]) => void }) {
  const [tagOpen, setTagOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const availableSuggestions = allTags.filter(
    t => !tags.includes(t) && (!inputValue || t.toLowerCase().includes(inputValue.toLowerCase())),
  );

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-1">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <Popover open={tagOpen} onOpenChange={setTagOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Tag className="h-3 w-3 mr-1" />
            Edit tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[220px]" align="start">
          <Command>
            <CommandInput
              placeholder="Add or search tags..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>No matching tags</CommandEmpty>
              <CommandGroup>
                {availableSuggestions.map(tag => (
                  <CommandItem
                    key={tag}
                    value={tag}
                    onSelect={() => {
                      onSave([...tags, tag]);
                      setInputValue('');
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const newTags = inputValue.split(',').map(t => t.trim()).filter(Boolean);
          if (newTags.length > 0) {
            onSave([...tags, ...newTags]);
            setInputValue('');
          }
        }}
        className="flex gap-1 mt-1"
      >
        <Input
          name="tags"
          aria-label="Asset tags"
          placeholder="Add tags (comma-separated)"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className="h-7 text-xs"
        />
        <Button type="submit" size="sm" className="h-7 text-xs">Save</Button>
      </form>
    </div>
  );
}

/** Metadata grouped by category in Accordion sections */
function MetadataAccordion({ metadata }: { metadata: AssetMetadataView }) {
  const fileFields = [
    { label: 'Type', value: metadata.metadataType },
    ...(metadata.captureDate ? [{ label: 'Capture Date', value: new Date(metadata.captureDate).toLocaleDateString() }] : []),
    ...(metadata.rawAvailable ? [{ label: 'RAW', value: 'Available' }] : []),
  ];

  const cameraFields = [
    ...(metadata.cameraMake ? [{ label: 'Make', value: metadata.cameraMake }] : []),
    ...(metadata.cameraModel ? [{ label: 'Model', value: metadata.cameraModel }] : []),
    ...(metadata.lensModel ? [{ label: 'Lens', value: metadata.lensModel }] : []),
    ...(metadata.exposureSummary ? [{ label: 'Exposure', value: metadata.exposureSummary }] : []),
  ].filter(Boolean);

  const videoFields = metadata.metadataType === 'video' ? [
    ...(metadata.videoDuration ? [{ label: 'Duration', value: `${Math.round(metadata.videoDuration)}s` }] : []),
    ...(metadata.videoCodec ? [{ label: 'Codec', value: metadata.videoCodec }] : []),
    ...(metadata.frameRate ? [{ label: 'Frame Rate', value: `${metadata.frameRate} fps` }] : []),
  ] : [];

  return (
    <Accordion type="multiple" defaultValue={['file-info']} className="mt-2">
      <AccordionItem value="file-info">
        <AccordionTrigger className="text-xs py-1.5">File Info</AccordionTrigger>
        <AccordionContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
            {fileFields.map(f => (
              <><dt className="text-muted-foreground">{f.label}</dt><dd>{f.value}</dd></>
            ))}
          </dl>
        </AccordionContent>
      </AccordionItem>

      {cameraFields.length > 0 && (
        <AccordionItem value="camera-info">
          <AccordionTrigger className="text-xs py-1.5">Camera Info</AccordionTrigger>
          <AccordionContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
              {cameraFields.map(f => (
                <><dt className="text-muted-foreground">{f!.label}</dt><dd>{f!.value}</dd></>
              ))}
            </dl>
          </AccordionContent>
        </AccordionItem>
      )}

      {videoFields.length > 0 && (
        <AccordionItem value="video-info">
          <AccordionTrigger className="text-xs py-1.5">Video Info</AccordionTrigger>
          <AccordionContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
              {videoFields.map(f => (
                <><dt className="text-muted-foreground">{f.label}</dt><dd>{f.value}</dd></>
              ))}
            </dl>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
