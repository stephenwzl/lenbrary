# Data Model: Frontend API Polish

## Library View State

Represents the page's current working context.

**Fields**:

- `loadedAssets`: assets currently visible or cached for the current result set.
- `selectedAssetId`: asset currently open in detail, if any.
- `filters`: active Filter Set.
- `pagination`: current offset, page size, and whether more results are available.
- `loadingState`: idle, loading, loading-more, refreshing, or error.
- `feedback`: latest Feedback Message.

**Relationships**:

- Owns one Filter Set.
- References zero or one Asset Detail Panel.
- Receives Import Queue Item updates.

**Validation rules**:

- Changing filters resets pagination and preserves clear feedback.
- Loading additional results must preserve filters.
- Deleting an asset removes it from loaded assets and clears detail if it was selected.

## Filter Set

Represents all user-selected asset constraints.

**Fields**:

- `mediaType`: all, image, or video.
- `favorite`: all, favorites only, or non-favorites when supported.
- `tag`: free-form tag text.
- `camera`: free-form camera/lens search text.
- `dateFrom`: start date.
- `dateTo`: end date.
- `thumbnailAvailability`: all, has thumbnail, missing thumbnail.
- `metadataAvailability`: all, has metadata, missing metadata.

**Relationships**:

- Belongs to Library View State.
- Produces active filter chips or equivalent visible state.

**Validation rules**:

- Date range must be understandable when one side is missing.
- Clearing one filter must leave other filters unchanged.
- Clearing all filters returns to the unfiltered first page.

## Import Queue Item

Represents one selected file during import.

**Fields**:

- `fileName`: user-visible file name.
- `status`: queued, uploading, accepted, duplicate, unsupported, failed, or complete.
- `message`: user-facing status message.
- `linkedAssetId`: existing or created asset when available.
- `mediaType`: detected image/video type when available.
- `retryAvailable`: whether the user can try again.

**Relationships**:

- May link to an asset card or detail panel when accepted or duplicate.

**Validation rules**:

- Every selected file receives a terminal or actionable state.
- Duplicate outcomes must not create duplicate cards.
- Failed or unsupported outcomes must not hide successful imports.

## Asset Detail Panel

Represents the selected asset's user-facing details.

**Fields**:

- `assetIdentity`: filename, type, size, import date, duplicate identity.
- `availability`: original, thumbnail, metadata, and processing health.
- `metadataGroups`: grouped photo/video metadata sections.
- `organization`: favorite state and tags.
- `actions`: open original, save markers, delete.
- `feedback`: action-specific success/error state.

**Relationships**:

- Reads from Library View State selected asset.
- Updates Filter Set results after marker changes or deletion.

**Validation rules**:

- Missing original is a warning stronger than missing metadata or thumbnail.
- Delete action must name the asset and require confirmation.
- Metadata must be readable and sparse-friendly.

## Feedback Message

Represents page-visible communication to the user.

**Fields**:

- `severity`: info, success, warning, or error.
- `message`: concise user-facing text.
- `scope`: global, import, filter, detail, status, or export.
- `action`: optional next action such as retry, clear filters, or open asset.

**Relationships**:

- Belongs to Library View State or Asset Detail Panel.

**Validation rules**:

- Errors must remain visible until dismissed or replaced.
- Success messages may be temporary but must last long enough to be perceived.
- Destructive action feedback must be explicit.

## Responsive Layout State

Represents layout behavior at desktop and mobile-width screens.

**Fields**:

- `viewportCategory`: desktop, tablet-width, or mobile-width.
- `filterLayout`: expanded, wrapped, or compact.
- `assetLayout`: grid or single-column list.
- `detailLayout`: side panel or stacked panel.
- `statusLayout`: inline panel or stacked panel.

**Relationships**:

- Applies to Library View State, Filter Set, Import Queue, and Asset Detail Panel.

**Validation rules**:

- Critical labels and destructive confirmations must remain readable.
- Controls must not overlap at tested widths.
- Detail content must remain reachable without losing browsing context.

## State Transitions

### Filter Set

```text
inactive -> active -> partially-cleared -> active
active -> cleared -> inactive
```

### Import Queue Item

```text
queued -> uploading -> accepted -> complete
queued -> uploading -> duplicate -> complete
queued -> uploading -> unsupported
queued -> uploading -> failed -> retry-available
```

### Library View State

```text
idle -> loading -> loaded
loaded -> loading-more -> loaded
loaded -> refreshing -> loaded
loaded -> error -> loaded
```
