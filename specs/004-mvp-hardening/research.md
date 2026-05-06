# Research: MVP Hardening

## Decision 1: Make library import perform real per-file processing

**Decision**: `/api/library/import` should process each selected file through the same accepted asset lifecycle used by single uploads, returning final per-file statuses where possible: accepted, duplicate, unsupported, failed.

**Rationale**: The current import endpoint detects media type and returns `processing-pending`, which does not satisfy the MVP reliability goal. Users need one browser batch path that actually imports supported files, distinguishes duplicates, isolates failures, and keeps successful files usable.

**Alternatives considered**:

- Keep import as a preflight-only endpoint: rejected because the browser MVP would still depend on a second hidden path and could repeat the PNG failure gap.
- Call the public single-upload endpoint from browser JavaScript for every file: possible, but weaker for consistent per-file import event recording and harder to make batch failure evidence coherent.

## Decision 2: Use curated fixture media plus generated edge cases

**Decision**: Build a small test fixture set covering real supported formats and generated edge cases, with licensing-safe tiny media files where possible. Damaged, unsupported, zero-byte, duplicate-name, and duplicate-content cases can be generated locally for tests.

**Rationale**: The success criteria require repeatable coverage without relying on a user's private media. Small fixtures keep repository and test runtime manageable while still exercising realistic content paths.

**Alternatives considered**:

- Use only synthetic buffers: rejected because format detection, thumbnailing, and metadata behavior must be exercised with real media containers.
- Check in a large real camera/video corpus: rejected because it increases repository size and licensing/privacy risk.

## Decision 3: Add browser acceptance coverage for the visible MVP path

**Decision**: Add a repeatable browser acceptance workflow that starts the local app, uses the static page, uploads fixtures through the file input, and verifies visible import, browsing, filtering, detail, favorite/tag, delete, health, and export states.

**Rationale**: Previous lower-level test coverage missed a real user-visible PNG upload failure. Browser-path coverage should be treated as the MVP confidence gate because it exercises the page, network calls, and rendered result states together.

**Alternatives considered**:

- Rely on API integration tests only: rejected because API tests can pass while browser wiring or UI state still fails.
- Make manual QA the only browser check: rejected because regressions need repeatable evidence before commit/merge.

## Decision 4: Implement batch operations as explicit user-facing actions

**Decision**: Add multi-select state in the UI and explicit batch support for tag application, favorite state changes, and confirmed deletion. Server support may be added as batch endpoints or carefully coordinated repeated single-asset calls, but the UI must produce one clear batch result.

**Rationale**: Personal photo cleanup becomes tedious without batch actions. The user-facing contract is more important than the internal transport: selection count, confirmation, partial result summary, and preserved library context must be clear.

**Alternatives considered**:

- Leave users with one-by-one actions: rejected because it weakens the MVP's practical value for real collections.
- Add advanced albums/smart collections now: rejected because batch tags/favorites/deletion provide more immediate MVP value with less product complexity.

## Decision 5: Add grouped browsing without replacing the filterable grid

**Decision**: Add a grouping mode to the existing library view for flat, timeline, tag, and camera grouping. Grouping should preserve active filters and selected asset context.

**Rationale**: Photography enthusiasts remember shoots by time, camera, and informal organization. Grouping improves library comprehension while reusing the current browsing surface.

**Alternatives considered**:

- Build a separate timeline page: rejected because it splits the MVP surface and adds navigation complexity.
- Delay grouping until full search exists: rejected because grouped browsing is a small but meaningful step toward collection usability.

## Decision 6: Make health issues actionable and bounded

**Decision**: Health should expose issue severity, affected asset context, and practical guidance for missing originals, missing thumbnails, missing metadata, duplicate import events, and export boundaries.

**Rationale**: The MVP should help users understand whether the catalog is trustworthy. It must also be explicit that summary export is not original-media backup.

**Alternatives considered**:

- Keep aggregate counts only: rejected because counts do not tell the user what to inspect or fix.
- Add automatic repair/backup/restore now: rejected because it expands scope and changes the data durability promise.

## Decision 7: Migrate the UI to React without changing deployment shape

**Decision**: Replace the static browser script with a React UI built by Vite, while keeping the same single-process app, local persistence, and liquid glass UI direction. Do not introduce accounts, sharing, cloud sync, or a separate frontend service for this feature.

**Rationale**: Import queues, multi-select batch actions, grouped browsing, health issue presentation, and browser acceptance selectors are state-heavy enough that React will reduce UI coordination risk. Keeping React inside the existing app preserves the local/private deployment model.

**Alternatives considered**:

- Keep the static UI: rejected after the React requirement because the next MVP workflow needs more stateful interaction than the static script should carry.
- Add authentication or sharing: rejected because it conflicts with the single-user private MVP boundary.
