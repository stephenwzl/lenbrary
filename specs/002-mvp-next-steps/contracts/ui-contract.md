# UI Contract: MVP Next Steps

## Scope

The MVP UI is a browser-based personal media library surface for one user in a trusted private environment. It must make the existing media backend usable without requiring endpoint documentation.

## Primary Views

### Import Panel

**Responsibilities**:

- Let the user select multiple image/video files.
- Show per-file progress and final outcome.
- Distinguish accepted, duplicate, unsupported, failed, and processing-pending states.
- Keep successfully imported assets visible in the library after import.

**Empty/error states**:

- No files selected.
- Unsupported media.
- Upload failure.
- Duplicate recognized.
- Thumbnail or metadata unavailable after successful import.

### Library Grid/List

**Responsibilities**:

- Show visual asset entries with stable dimensions.
- Display preview when available and a clear fallback when not.
- Show original filename or capture identity, media type, import/capture date when available, and favorite/tag indicators.
- Allow filtering by media type, date/metadata dimensions when available, favorite state, and tags.
- Keep sparse metadata understandable instead of hiding assets.

**Interaction target**:

- A 200-asset personal library can be narrowed by type and one date/metadata dimension within 5 seconds of interaction time.

### Asset Detail

**Responsibilities**:

- Show larger preview or fallback state.
- Provide original-file access.
- Show file facts, available image/video metadata, duplicate identity when relevant, favorite state, tags, and processing health.
- Allow favorite toggle and tag editing once P2 is implemented.
- Provide delete action with confirmation.

**Destructive behavior**:

- Delete requires confirmation.
- Success removes the asset from current browsing results.
- Failure explains the issue without losing the user's context.

### Library Status

**Responsibilities**:

- Show total, image, video, duplicate, missing thumbnail, missing metadata, and missing original counts.
- Show storage location guidance without turning status into a full backup workflow.
- Treat missing originals as critical issues and missing thumbnail/metadata as warnings.

### Summary Export

**Responsibilities**:

- Let the user export a readable asset catalog and metadata index.
- State that original media files are not included.
- Make the export useful outside the application for audit, migration planning, and backup planning.

## Navigation Expectations

- The first screen should be the usable library experience, not a marketing page.
- Import, library browsing, filters, detail, status, and export should be reachable without reading documentation.
- Users should be able to return from detail to the same library context.

## Visual And Interaction Constraints

- Controls should be dense and work-focused because this is a personal management tool.
- Use familiar controls for upload, filters, favorite, tags, delete, status, and export.
- Text must fit across desktop and mobile-width layouts.
- Missing preview/metadata states must be explicit and not look like broken UI.

## MVP Completion Checks

- A user can import 20 mixed assets, browse them, open detail, and delete one asset in under 10 minutes.
- Import outcomes are understandable without inspecting logs.
- Metadata and missing metadata are both understandable.
- Favorites and tags remain visible after navigating away and returning.
- The export can be opened outside Lenbrary and understood as a catalog/index, not a backup archive.
