# Research: MVP Next Steps

## Decision 1: Single-process MVP With Lightweight Web UI

**Decision**: Serve a lightweight browser UI from the existing application process instead of creating a separate frontend package for the first MVP.

**Rationale**: The current repository is a single Node.js/TypeScript Express service with no frontend build system. The MVP needs a usable personal review loop, not frontend-platform complexity. Serving a small UI from the existing app keeps setup, deployment, Docker behavior, and testing simple while validating whether the product loop is valuable.

**Alternatives considered**:

- Separate React/Vite application: more scalable for a mature UI, but adds package structure, build integration, routing, and deployment decisions before MVP validation.
- Endpoint documentation only: cheapest technically, but fails the core MVP goal because users still need to understand API documentation.
- Native desktop app: potentially aligned with personal media management, but too large for the fastest MVP.

## Decision 2: Reuse Existing Asset Foundation And Add Library-Oriented Endpoints

**Decision**: Keep current asset upload/list/detail/file/thumbnail/EXIF/delete behavior and add library-oriented endpoints for richer query, health, summary export, and organization markers.

**Rationale**: Existing service responsibilities already match the media foundation: ingestion, hash dedupe, thumbnails, metadata, persistence, and deletion. MVP work should expose those capabilities in user-facing workflows and add the minimal missing concepts rather than redesigning storage.

**Alternatives considered**:

- Rewrite the asset API around a new library domain: cleaner long-term naming, but high migration risk and unnecessary for MVP.
- Build UI only against existing endpoints: possible for P1 basics, but insufficient for P2 tags/favorites, P3 status/export, and richer filters.

## Decision 3: Store Favorites And Tags In SQLite

**Decision**: Add SQLite-backed persistence for favorite state and free-form tags, associated with existing assets.

**Rationale**: Favorites and tags are user-generated organization state and must survive app restarts. They belong beside existing asset records for a personal local library. SQLite migrations fit the current architecture and allow filtering/export without introducing a second store.

**Alternatives considered**:

- Store markers in browser local storage: fast for a demo, but loses trust and breaks portability/export.
- Store tags inside raw metadata fields: mixes user intent with extracted media metadata and complicates search.
- Add albums/ratings/color labels now: useful later, but beyond the first organization model in the spec.

## Decision 4: Treat Batch Import As Repeated Single-File Upload With Aggregated Outcomes

**Decision**: Implement batch import UX as multiple file uploads with a per-file result model, optionally backed by a batch endpoint if task planning finds it simpler for validation.

**Rationale**: Current upload behavior is single-file and already detects accepted, duplicate, unsupported, and failed outcomes. The MVP requirement is user-facing per-file clarity, not necessarily a new transport primitive. This avoids destabilizing media processing while allowing the UI to show progress and outcomes.

**Alternatives considered**:

- Add one multipart batch endpoint immediately: cleaner user-facing contract but larger error-handling and partial-success surface.
- Require one-by-one manual uploads: too slow and fails the 20-file import success criterion.

## Decision 5: Library Filtering Starts With Available Indexed Fields And Metadata Joins

**Decision**: Support MVP filters for media type, import/capture date, camera/lens metadata when available, favorites, and tags. Sparse metadata must be represented as unavailable rather than as an error.

**Rationale**: These filters match the personal photography/media product goal and current metadata capabilities. Date and camera metadata are high-value for enthusiasts, while favorites/tags provide personal organization. Sparse metadata is normal across media formats and should not block browsing.

**Alternatives considered**:

- Full-text search across all metadata: attractive but too broad for MVP.
- Album-first organization: useful but adds collection modeling before the review loop is proven.
- Only media-type filtering: too weak to validate media asset management value.

## Decision 6: Library Health Is A Read-Only Status Surface

**Decision**: Expose health/status as read-only counts and issue summaries: totals by media type, duplicates recognized, missing thumbnails, missing metadata, and missing originals when detectable.

**Rationale**: Users need confidence before trusting a personal collection. Read-only status gives visibility without promising automatic repair, backup, or restore in the MVP.

**Alternatives considered**:

- Build repair/reprocess workflows now: valuable but expands scope beyond MVP.
- Ignore health until backup exists: leaves users unable to understand reliability risks.

## Decision 7: Summary Export Is Catalog And Metadata Index Only

**Decision**: Export a readable asset catalog and metadata index that includes asset identity, file references, metadata availability, favorites, and tags, and excludes original media files.

**Rationale**: This follows the clarification. It reduces lock-in, supports manual audit/migration/backup planning, and avoids turning P3 into full backup/restore.

**Alternatives considered**:

- Include thumbnails: useful for offline review, but increases export size and scope.
- Include originals: becomes backup/export packaging and changes the product promise.
- Drop export: simpler, but weakens the trust story for a personal asset manager.

## Decision 8: Testing Focuses On Service Contracts And MVP Workflow Checks

**Decision**: Add focused automated tests for new persistence/service behavior and request contracts, plus a quickstart workflow that manually validates UI success criteria with a sample set.

**Rationale**: The repository has Vitest configured but no tests yet. New data model and API behavior should be protected with tests, while the UI workflow can initially be validated through documented checks until a browser automation setup exists.

**Alternatives considered**:

- Full browser automation first: desirable, but may be too much infrastructure for this planning step.
- Manual-only validation: too risky for database migrations and endpoint behavior.
