# Feature Specification: Frontend API Polish

**Feature Branch**: `003-frontend-api-polish`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: "完善前端页面，增加更多 API支持但是还没在页面上支持的功能，优化交互和UI"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Library Control Surface (Priority: P1)

As a personal photography/media library user, I want the main page to expose the important library capabilities already available behind the scenes, so that I can operate the product from the page without switching to endpoint documentation or manual requests.

**Why this priority**: The MVP already has useful backend capabilities, but the page only exposes a thin subset. A complete control surface turns the product from a technical demo into a usable personal tool.

**Independent Test**: Can be tested by starting with a populated library and confirming that the user can browse, page through results, apply and clear filters, inspect metadata, use original/thumbnail access, favorite, tag, delete, view status, and export from the page alone.

**Acceptance Scenarios**:

1. **Given** a library with more assets than one page can comfortably show, **When** the user browses the page, **Then** the user can load additional results without losing current filters or detail context.
2. **Given** active filters for media type, favorite state, tags, camera, date, thumbnail availability, or metadata availability, **When** the user reviews the page, **Then** each active filter is visible and can be cleared individually or all at once.
3. **Given** an asset with available photo or video metadata, **When** the user opens the asset detail view, **Then** the page shows the most useful metadata fields in readable groups and labels unavailable metadata explicitly.
4. **Given** an asset with original-file access or thumbnail access, **When** the user opens the detail view, **Then** the user can open the original and understand whether preview/original availability is healthy.
5. **Given** an unwanted asset, **When** the user deletes it, **Then** the deletion confirmation clearly names the asset, the result is visible, and the library refreshes without losing the user's broader context.

---

### User Story 2 - Import Workflow With Clear Progress And Outcomes (Priority: P2)

As a user importing personal media, I want a clear import queue with progress, duplicate recognition, unsupported-file handling, and retry guidance, so that I can trust the result of a mixed upload session.

**Why this priority**: Import is the first moment of trust. If the page hides partial failures or duplicates, users cannot tell whether their personal collection was handled correctly.

**Independent Test**: Can be tested by selecting a mixed file set that includes valid media, duplicate media, and unsupported files, then confirming every item receives a visible outcome and the library view updates predictably.

**Acceptance Scenarios**:

1. **Given** a mixed file selection, **When** import starts, **Then** the page shows queued, uploading, accepted, duplicate, unsupported, failed, and completed states where applicable.
2. **Given** duplicate files, **When** import completes, **Then** duplicate outcomes point the user to the existing library item rather than appearing as broken failures.
3. **Given** unsupported or failed files, **When** import completes, **Then** the page explains what happened and lets the user continue using successfully imported assets.
4. **Given** a large import selection, **When** import is running, **Then** the user can see progress and the page remains usable enough to avoid uncertainty.

---

### User Story 3 - UI Quality And Interaction Ergonomics (Priority: P3)

As an enthusiast repeatedly reviewing a personal collection, I want the interface to feel organized, responsive, and safe, so that routine browsing, filtering, and cleanup do not feel fragile or visually noisy.

**Why this priority**: The product is a personal management tool, not a landing page. Good ergonomics increase confidence and reduce accidental destructive actions.

**Independent Test**: Can be tested by using the page on desktop and mobile-width screens with empty, loading, error, populated, missing-preview, and missing-metadata states.

**Acceptance Scenarios**:

1. **Given** desktop and mobile-width screens, **When** the user browses and opens detail, **Then** the layout remains readable, controls do not overlap, and primary actions remain reachable.
2. **Given** empty, loading, error, no-results, and missing-preview states, **When** those states occur, **Then** the page shows clear user-facing messages and next actions.
3. **Given** destructive actions such as delete, **When** the user initiates them, **Then** the page uses confirmation and clear result feedback to reduce accidental loss.
4. **Given** library health warnings, **When** the user reviews the page, **Then** the warnings are visually distinct and connect to affected assets or status details where available.

### Edge Cases

- A large library should not force the user to reload the page or lose filters when moving through result pages.
- A filter combination that returns no results should be clearly distinguishable from an empty library.
- Metadata can be sparse, inconsistent, or unavailable; the UI must not imply extraction failure when the file simply lacks a field.
- Duplicate import outcomes should not create duplicate visual cards.
- Unsupported files in an import batch should not hide successful imports.
- Missing original files should be presented as a stronger warning than missing thumbnails or metadata.
- Export actions should communicate that the export is a catalog/metadata index, not a media-file backup.
- Mobile-width layouts must keep buttons, filters, cards, and detail content from overlapping or truncating critical labels.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST expose all MVP library capabilities that are currently usable through service endpoints, including browsing, filtering, detail, favorite state, tags, delete, health, original-file access, thumbnail availability, and summary export.
- **FR-002**: Users MUST be able to page or incrementally load library results while preserving active filters and selected context.
- **FR-003**: Users MUST be able to see, apply, and clear filters for media type, favorite state, tags, camera text, date range, thumbnail availability, and metadata availability.
- **FR-004**: The asset detail view MUST display grouped file facts, availability state, duplicate identity when available, photo/video metadata, favorite state, tags, original access, and delete controls.
- **FR-005**: The import experience MUST show per-file queued, uploading, accepted, duplicate, unsupported, failed, and completed outcomes as applicable.
- **FR-006**: Import outcomes MUST let users distinguish successful imports, duplicates, unsupported files, and failed files without reading logs or endpoint documentation.
- **FR-007**: Users MUST receive visible success or failure feedback for favorite, tag, delete, status, export, and import actions.
- **FR-008**: The page MUST include clear empty, loading, error, no-results, missing-preview, missing-metadata, and missing-original states.
- **FR-009**: The page MUST present library health information with severity differences between missing originals, missing thumbnails, and missing metadata.
- **FR-010**: The export action MUST communicate before or during use that the exported summary excludes original media files.
- **FR-011**: The interface MUST remain focused on a personal single-user media library and MUST NOT add public sharing, multi-user collaboration, hosted accounts, professional review workflows, or full backup/restore behavior.
- **FR-012**: The UI MUST be usable at desktop and mobile-width layouts without overlapping controls or unreadable critical text.
- **FR-013**: The UI MUST use a liquid glass visual style with translucent layered surfaces, backdrop blur, highlight borders, soft depth shadows, readable contrast, restrained motion, and clear focus states without reducing the clarity expected from a personal media management tool.

### Key Entities

- **Library View State**: Current page state including loaded assets, selected asset, active filters, pagination/loading state, and last action feedback.
- **Filter Set**: User-selected constraints for narrowing assets, including type, favorite, tag, camera, date range, thumbnail availability, and metadata availability.
- **Import Queue Item**: A selected file and its visible import state, outcome, message, linked existing asset when duplicate, and retry/continue guidance when relevant.
- **Asset Detail Panel**: User-facing detail representation for a selected asset, including preview/original availability, grouped metadata, markers, tags, and destructive actions.
- **Feedback Message**: Temporary or persistent UI message that explains success, warning, error, empty, or no-results states.
- **Responsive Layout State**: How the same library controls, grid/list, detail, and status areas adapt between desktop and mobile-width usage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can complete browse, filter, open detail, favorite, tag, delete, view health, and export actions from the page without using endpoint documentation.
- **SC-002**: A user can apply three filters, identify all active filters, clear one filter, and clear all filters in under 30 seconds.
- **SC-003**: A user can import a 20-file mixed set and identify the outcome of every file with 100% accuracy from visible page feedback.
- **SC-004**: A user can move through at least 200 assets using incremental loading or pagination without losing active filters.
- **SC-005**: At least 90% of tested desktop and mobile-width states show no overlapping controls, unreadable primary labels, or hidden destructive confirmations.
- **SC-006**: Users can distinguish missing original, missing thumbnail, and missing metadata states in asset detail or library health without external explanation.
- **SC-007**: The export flow makes it clear that original media files are excluded before the user treats the export as a backup.

## Assumptions

- The current backend/library service capabilities remain the source of truth for available asset operations.
- This feature improves the existing lightweight browser UI rather than introducing a separate full frontend application.
- The target user remains a single personal photography/media asset management enthusiast in a trusted private environment.
- Advanced capabilities such as albums, smart search, public sharing, multi-user accounts, permissions, and full backup/restore remain outside this feature unless specified later.
- Metadata display should prioritize readable high-value fields over exhaustive raw metadata dumps, while still making unavailable fields understandable.
- Liquid glass styling is a visual system constraint for this feature; it must support the personal library workflow rather than turning the page into a marketing-style landing page.
