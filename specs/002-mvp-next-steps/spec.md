# Feature Specification: MVP Next Steps

**Feature Branch**: `002-mvp-next-steps`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: "弄清楚我们接下来应该干什么，才能尽快搞出 MVP版本"

## Clarifications

### Session 2026-05-06

- Q: P3 的可移植摘要导出应包含什么范围？ → A: 导出可读的资产清单和元数据索引，不包含原始媒体文件。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Personal Library Review Loop (Priority: P1)

As a photography or media asset management enthusiast, I want to add a small batch of personal photos and videos, browse them visually, filter them by basic media and metadata attributes, open an asset detail view, and remove unwanted assets, so that Lenbrary feels like a usable personal media library rather than only a storage service.

**Why this priority**: This is the shortest path to an MVP because it turns the existing ingestion, thumbnail, metadata, listing, detail, and deletion capabilities into one user-facing loop with direct personal value.

**Independent Test**: Can be fully tested by importing a representative mixed-media sample set and confirming that the user can review, filter, inspect, and clean up the collection without reading endpoint documentation.

**Acceptance Scenarios**:

1. **Given** an empty personal library, **When** the user imports at least 20 mixed image and video files, **Then** the library shows visual entries for accepted assets and clearly reports unsupported, failed, or duplicate files.
2. **Given** an imported library, **When** the user browses the collection, **Then** each asset exposes a preview, filename or capture identity, media type, import time, and processing status when preview or metadata is unavailable.
3. **Given** an imported library containing photos and videos, **When** the user filters by media type and common metadata such as date or camera-related fields when available, **Then** the visible results update to the matching assets and make sparse metadata understandable.
4. **Given** a visible asset, **When** the user opens it, **Then** the user can view a larger preview, original-file access, core file details, available photo/video metadata, duplicate identity when relevant, and a delete action.
5. **Given** an unwanted asset, **When** the user deletes it and confirms the destructive action, **Then** the asset disappears from browsing and the user receives a clear success or failure outcome.

---

### User Story 2 - Lightweight Organization Markers (Priority: P2)

As an enthusiast reviewing a personal collection, I want to mark assets with simple personal organization signals such as favorites and free-form tags, so that I can quickly return to meaningful files after the first import.

**Why this priority**: Organization is central to media asset management, but basic browsing and inspection must exist first; simple markers are the smallest useful step before richer albums or workflows.

**Independent Test**: Can be tested by marking several assets, filtering by those markers, and confirming that the markers remain available after leaving and returning to the library.

**Acceptance Scenarios**:

1. **Given** an imported collection, **When** the user favorites or unfavorites an asset, **Then** the favorite state is visible in browsing and detail views.
2. **Given** an asset detail view, **When** the user adds or removes free-form tags, **Then** the updated tags are visible on that asset and can be used to narrow the collection.
3. **Given** assets with favorites and tags, **When** the user filters by favorite state or tag, **Then** only matching assets are shown.

---

### User Story 3 - Personal Data Confidence (Priority: P3)

As a user trusting Lenbrary with personal media, I want a simple way to understand where my originals, previews, and library records live and to export a readable asset catalog and metadata index, so that I can evaluate whether the MVP is safe enough for continued use without mistaking the export for a full backup.

**Why this priority**: Data confidence matters for a personal asset manager because users need to know whether their personal collection is understandable outside the application. A readable catalog and metadata index reduces lock-in risk, supports manual audit or migration planning, and avoids expanding the MVP into full backup and restore.

**Independent Test**: Can be tested by reviewing storage status, exporting a library summary, and confirming that the export includes asset identity, file references, metadata availability, favorites, and tags, while excluding original media files.

**Acceptance Scenarios**:

1. **Given** a populated library, **When** the user opens library status, **Then** the user can see counts by media type, duplicate count, thumbnail or metadata failure count, and storage locations or operator guidance.
2. **Given** a populated library, **When** the user exports a library summary, **Then** the export contains portable records for assets, file references, metadata, and organization markers without requiring the original application interface or copying original media files.
3. **Given** missing thumbnails, missing metadata, or missing originals, **When** the user checks status or asset detail, **Then** the product explains the issue and avoids presenting the library as fully healthy.

### Edge Cases

- Duplicate imports should not create confusing repeated assets; the user should see that existing content was recognized.
- Unsupported media should be rejected with a clear reason and should not leave broken library entries.
- Assets with missing or sparse metadata should remain browseable and filterable by available fields.
- Thumbnail or metadata extraction failures should be visible but should not prevent original-file preservation.
- Very large personal batches should provide progress and a recoverable outcome instead of leaving the user uncertain.
- Deleting an asset must require confirmation and must clearly communicate whether original media and derived previews were removed.
- Files moved or removed outside the product should be shown as library health problems rather than silent empty previews.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST define the first MVP as a single-user personal media library review loop for photography and media asset management enthusiasts.
- **FR-002**: Users MUST be able to import a batch of personal image and video files and receive per-file outcomes for accepted, duplicate, unsupported, and failed files.
- **FR-003**: Users MUST be able to browse imported assets in a visual library view with stable previews or clear fallback states.
- **FR-004**: Users MUST be able to filter the library by media type, import or capture date when available, and common camera or media metadata when available.
- **FR-005**: Users MUST be able to open an asset detail view that presents preview, original access, core file information, available image or video metadata, duplicate status when relevant, and processing health.
- **FR-006**: Users MUST be able to delete an asset through a confirmed destructive action and receive a clear outcome.
- **FR-007**: The product MUST treat favorite state and free-form tags as the first lightweight personal organization model after the core review loop.
- **FR-008**: Users MUST be able to filter by favorites and tags once those markers exist.
- **FR-009**: The product MUST expose basic library health and status information, including asset counts, duplicate handling, missing previews or metadata, and missing originals when detectable.
- **FR-010**: Users MUST be able to export a readable portable library summary containing asset identity, file references, available metadata, and personal organization markers, and the MVP summary export MUST NOT include original media files.
- **FR-011**: The MVP MUST remain scoped to a trusted personal or private environment and MUST NOT require multi-user collaboration, public sharing, hosted accounts, rights management, or professional approval workflows.
- **FR-012**: The MVP MUST present unavailable metadata, preview failures, duplicate detection, unsupported files, and deletion failures in plain user-facing language.

### Key Entities

- **Personal Library**: The user's local or private collection of managed media assets, including collection status and health signals.
- **Media Asset**: A personal image or video file known to the library, with file identity, media type, preview state, original access, metadata availability, duplicate status, and deletion state.
- **Import Result**: The per-file outcome of a batch import, including accepted, duplicate, unsupported, failed, and processing-pending states.
- **Asset Metadata**: User-visible technical and capture information extracted from an asset, such as dates, dimensions, camera or lens fields, and video characteristics when available.
- **Organization Marker**: A lightweight personal signal applied by the user, initially favorite state and free-form tags.
- **Library Summary Export**: A readable portable record of library contents and organization state for audit, migration planning, or backup planning. It includes asset identity, file references, available metadata, and personal organization markers, but does not include original media files in the MVP.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can import 20 mixed photos and videos, browse results, open an asset detail view, and delete one unwanted asset in under 10 minutes.
- **SC-002**: At least 90% of accepted assets in a representative sample show either a generated preview or a clear user-facing reason why no preview is available.
- **SC-003**: At least 90% of assets with available capture or media metadata expose that metadata in browsing filters or detail views in user-understandable labels.
- **SC-004**: Users can identify duplicate, unsupported, failed, and successfully imported files from a batch import without inspecting logs or endpoint documentation.
- **SC-005**: Users can narrow a 200-asset personal library by media type and at least one date or metadata dimension in under 5 seconds of interaction time.
- **SC-006**: After favorites and tags are added, users can mark and later find a tagged or favorited asset with 95% task completion in a small usability review.
- **SC-007**: A maintainer can use this specification to classify proposed next work as MVP-critical, post-MVP, or out of scope in under 10 minutes.
- **SC-008**: A user can open the exported library summary with a general-purpose viewer and identify at least 95% of asset records, file references, available metadata, favorites, and tags without access to the original application interface.

## Assumptions

- The MVP targets one person managing a private personal collection, not a team, public audience, or hosted customer base.
- The fastest MVP path should reuse the current ingestion, duplicate detection, thumbnail, metadata, listing, retrieval, and deletion foundation rather than redefining the product around collaboration or publishing.
- The first user-facing experience should prioritize browser-based personal review because the current service already supports media asset workflows but lacks a dedicated end-user library surface.
- Favorites and tags are sufficient as the first organization model; albums, ratings, color labels, smart collections, and advanced search are post-MVP unless later evidence proves they are required for first-use value.
- A full backup and restore system is post-MVP; the MVP export is an audit and portability aid, not a copy of the user's original media files.
- Authentication and public network hardening are not part of this MVP unless the product is intentionally exposed beyond a trusted personal or private environment.
