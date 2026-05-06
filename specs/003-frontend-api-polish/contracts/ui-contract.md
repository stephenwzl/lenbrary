# UI Contract: Frontend API Polish

## Scope

This contract defines the enhanced personal library page behavior. The page must expose existing library capabilities without requiring endpoint documentation.

## Main Page Regions

### Global Feedback

- Shows success, warning, error, and informational messages.
- Supports action-scoped feedback for import, filters, details, status, and export.
- Errors remain visible until dismissed or replaced.

### Import Queue

- File selection creates visible queue items before upload starts.
- Each queue item shows file name, status, and result message.
- Statuses include queued, uploading, accepted, duplicate, unsupported, failed, and complete.
- Duplicate items expose a way to open or locate the existing asset when possible.
- Failed or unsupported items do not block successfully imported items.

### Filter Bar

- Provides controls for media type, favorite state, tag, camera text, date range, thumbnail availability, and metadata availability.
- Active filters are visible as chips, badges, or equivalent persistent state.
- Each active filter can be cleared independently.
- All filters can be cleared at once.
- Changing filters resets pagination and reloads the first result set.

### Asset Results

- Shows cards/list rows with stable preview dimensions and readable file identity.
- Missing preview state is explicit.
- Health state is visible enough to distinguish missing original from missing thumbnail or missing metadata.
- Supports incremental loading or pagination without losing filters.
- Selecting an asset opens detail without clearing filters.

### Asset Detail

- Shows preview or fallback, original access, core file facts, duplicate identity when available, favorite state, tags, and grouped metadata.
- Metadata groups should prioritize file facts, capture/camera details, video details, and availability.
- Unavailable metadata is labeled clearly.
- Favorite and tag changes show feedback and update visible cards.
- Delete requires confirmation that names the asset and shows the final result.

### Library Health

- Shows total/image/video counts, duplicate count, missing originals, missing thumbnails, and missing metadata.
- Missing originals are presented as critical; missing thumbnails/metadata are warnings.
- Health state should connect back to browsing/filtering when practical.

### Export

- Export control states that the output is a catalog/metadata index.
- Export control states that original media files are not included.
- Export errors and success are visible.

## Visual System Contract

- All major operational surfaces use a liquid glass treatment: translucent background, backdrop blur, subtle inner highlight, 1px highlight border, and soft shadow depth.
- Liquid glass is a functional visual system, not a landing-page treatment. It must support dense scanning, repeated filtering, import review, and destructive-action safety.
- Buttons, filter chips, queue rows, cards, detail panels, status panels, and feedback messages must have visible hover, active, disabled, keyboard focus, and reduced-motion states.
- Status colors must remain semantic and readable over glass surfaces: success, warning, danger, info, and muted states cannot rely on blur alone.
- Mobile-width layouts must stack glass panels without overlapping controls, clipping critical labels, or hiding destructive confirmations.

## Responsive Expectations

- Desktop: library results and detail can appear side by side.
- Mobile-width: filters, results, detail, import queue, and status stack cleanly.
- Buttons and form controls must remain tappable and readable.
- Text must wrap without hiding critical labels.

## Completion Checks

- User can browse, filter, detail, favorite, tag, delete, health-check, and export from the page alone.
- User can apply and clear three filters in under 30 seconds.
- User can identify every outcome in a 20-file import set.
- User can navigate at least 200 assets through pagination/load-more.
- Desktop and mobile-width layouts avoid overlap in tested states.
