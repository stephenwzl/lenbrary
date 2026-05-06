# Tasks: MVP Next Steps

**Input**: Design documents from `/specs/002-mvp-next-steps/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Include focused automated tests because the plan calls for persistence/service and contract-style coverage for new MVP behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or has no dependency on incomplete tasks.
- **[Story]**: User story label for story-specific tasks only.
- Every task includes an exact file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the repository for testable MVP implementation without changing product behavior yet.

- [X] T001 Create test directory structure in tests/unit/, tests/contract/, and tests/integration/
- [X] T002 [P] Add Vitest test setup helpers for isolated temp data directories in tests/helpers/test-env.ts
- [X] T003 [P] Add HTTP test helper for Express app requests in tests/helpers/http.ts
- [X] T004 [P] Add lightweight UI asset build/copy decision note in docs/architecture.md
- [X] T005 Verify current baseline commands run before feature work with npm run lint, npm run typecheck, and npm test

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared domain, migration, routing, and service foundations required before any user story can be implemented.

**CRITICAL**: No user story work should begin until this phase is complete.

- [X] T006 Create shared MVP library types in src/types/library.types.ts
- [X] T007 Add organization marker migration for favorites and tags in src/migrations/V00000008__add_library_markers.sql
- [X] T008 Add duplicate import event tracking migration in src/migrations/V00000009__add_import_events.sql
- [X] T009 Extend DatabaseService with library marker, import event, and library query methods in src/services/database.service.ts
- [X] T010 [P] Create LibraryService skeleton and mapping helpers in src/services/library.service.ts
- [X] T011 Create library route skeleton and mount it under /api/library in src/routes/library.routes.ts and src/routes/index.ts
- [X] T012 Add static UI serving path for the planned MVP library screen in src/app.ts
- [X] T013 [P] Add unit tests for library type mapping and processing health derivation in tests/unit/library-service.test.ts
- [X] T014 Add database tests for marker and import event persistence in tests/unit/database-library.test.ts

**Checkpoint**: Foundation ready; user story implementation can now begin.

---

## Phase 3: User Story 1 - Personal Library Review Loop (Priority: P1) MVP

**Goal**: A user can import a mixed batch, see per-file outcomes, browse visually, filter by basic media/metadata fields, open details, and delete one asset through a confirmed action.

**Independent Test**: Import a representative mixed-media sample set and confirm the user can review, filter, inspect, and clean up the collection without reading endpoint documentation.

### Tests for User Story 1

- [X] T015 [P] [US1] Add contract tests for GET /api/library/assets filtering in tests/contract/library-assets.test.ts
- [X] T016 [P] [US1] Add contract tests for GET /api/library/assets/:id detail response in tests/contract/library-asset-detail.test.ts
- [X] T017 [P] [US1] Add integration test for import outcome aggregation in tests/integration/import-review-loop.test.ts
- [X] T018 [P] [US1] Add integration test for delete behavior updating the library view in tests/integration/delete-review-loop.test.ts

### Implementation for User Story 1

- [X] T019 [US1] Implement Media Asset View mapping in src/services/library.service.ts
- [X] T020 [US1] Implement capture/import date and camera metadata filter query support in src/services/database.service.ts
- [X] T021 [US1] Implement GET /api/library/assets with pagination, media type, date, camera, hasThumbnail, and hasMetadata filters in src/routes/library.routes.ts
- [X] T022 [US1] Implement GET /api/library/assets/:id detail response in src/routes/library.routes.ts
- [X] T023 [US1] Enrich upload duplicate/unsupported/failure handling with UI-safe import result fields in src/routes/assets.routes.ts
- [X] T024 [US1] Implement POST /api/library/import as multi-file import outcome endpoint or repeated-upload aggregation wrapper in src/routes/library.routes.ts
- [X] T025 [US1] Ensure deletion removes derived library state and reports user-safe outcomes in src/routes/assets.routes.ts
- [X] T026 [P] [US1] Create MVP UI shell and layout in src/ui/index.html
- [X] T027 [P] [US1] Create MVP UI styles for import, filters, grid, detail, and fallback states in src/ui/styles.css
- [X] T028 [US1] Implement import panel and per-file outcome rendering in src/ui/app.ts
- [X] T029 [US1] Implement visual library list/grid with thumbnail fallback states in src/ui/app.ts
- [X] T030 [US1] Implement media/date/camera/metadata filters in src/ui/app.ts
- [X] T031 [US1] Implement asset detail panel with preview, file access, metadata, duplicate identity, and health state in src/ui/app.ts
- [X] T032 [US1] Implement delete confirmation and post-delete library refresh in src/ui/app.ts
- [X] T033 [US1] Update README quickstart with MVP library UI URL and review-loop validation in README.md

**Checkpoint**: User Story 1 is functional and can be demoed as the first MVP.

---

## Phase 4: User Story 2 - Lightweight Organization Markers (Priority: P2)

**Goal**: A user can favorite/unfavorite assets, edit free-form tags, and filter the library by favorites and tags.

**Independent Test**: Mark several assets, filter by those markers, leave and return to the library, and confirm markers remain available.

### Tests for User Story 2

- [X] T034 [P] [US2] Add contract tests for PUT /api/library/assets/:id/favorite in tests/contract/library-favorite.test.ts
- [X] T035 [P] [US2] Add contract tests for PUT /api/library/assets/:id/tags in tests/contract/library-tags.test.ts
- [X] T036 [P] [US2] Add integration test for favorite/tag persistence and filtering in tests/integration/organization-markers.test.ts

### Implementation for User Story 2

- [X] T037 [US2] Implement favorite state methods in src/services/database.service.ts
- [X] T038 [US2] Implement tag replace/list/filter methods in src/services/database.service.ts
- [X] T039 [US2] Add favorite and tag data to Media Asset View responses in src/services/library.service.ts
- [X] T040 [US2] Implement PUT /api/library/assets/:id/favorite in src/routes/library.routes.ts
- [X] T041 [US2] Implement PUT /api/library/assets/:id/tags with trim, dedupe, and validation in src/routes/library.routes.ts
- [X] T042 [US2] Extend GET /api/library/assets filters for favorite and tag in src/routes/library.routes.ts
- [X] T043 [US2] Add favorite toggle controls to asset cards and detail in src/ui/app.ts
- [X] T044 [US2] Add tag editing controls to asset detail in src/ui/app.ts
- [X] T045 [US2] Add favorite and tag filter controls to the library view in src/ui/app.ts
- [X] T046 [US2] Style favorite/tag controls and tag chips in src/ui/styles.css

**Checkpoint**: User Story 2 works independently on top of the library review loop.

---

## Phase 5: User Story 3 - Personal Data Confidence (Priority: P3)

**Goal**: A user can inspect library health and export a readable asset catalog/metadata index that excludes original media files.

**Independent Test**: Review storage/status, export a summary, and confirm it includes asset identity, file references, metadata availability, favorites, and tags while excluding original media files.

### Tests for User Story 3

- [X] T047 [P] [US3] Add contract tests for GET /api/library/health in tests/contract/library-health.test.ts
- [X] T048 [P] [US3] Add contract tests for GET /api/library/export in tests/contract/library-export.test.ts
- [X] T049 [P] [US3] Add integration test for missing original/thumbnail/metadata health states in tests/integration/library-health.test.ts
- [X] T050 [P] [US3] Add integration test that exported summary excludes media bytes in tests/integration/library-export.test.ts

### Implementation for User Story 3

- [X] T051 [US3] Implement library health aggregation in src/services/library.service.ts
- [X] T052 [US3] Add database/service support for counting missing metadata and duplicate import events in src/services/database.service.ts
- [X] T053 [US3] Implement filesystem availability checks for originals and thumbnails in src/services/library.service.ts
- [X] T054 [US3] Implement GET /api/library/health in src/routes/library.routes.ts
- [X] T055 [US3] Implement readable catalog/metadata export generation in src/services/library.service.ts
- [X] T056 [US3] Implement GET /api/library/export with downloadable structured output in src/routes/library.routes.ts
- [X] T057 [US3] Add library status panel to the MVP UI in src/ui/app.ts
- [X] T058 [US3] Add summary export action and explicit "no original media included" message in src/ui/app.ts
- [X] T059 [US3] Style status warnings and export controls in src/ui/styles.css

**Checkpoint**: User Story 3 adds trust and portability without becoming backup/restore.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, validation, and documentation across the MVP.

- [X] T060 [P] Update docs/product.md with MVP scope, P1/P2/P3 boundaries, and post-MVP exclusions
- [X] T061 [P] Update docs/architecture.md with library endpoints, UI serving, marker persistence, health, and export notes
- [X] T062 [P] Update docs/project-knowledge.md with the chosen next-step MVP direction
- [X] T063 Run full validation commands npm run lint, npm run typecheck, and npm test
- [X] T064 Execute the manual MVP workflow from specs/002-mvp-next-steps/quickstart.md with a 20-file sample set
- [X] T065 Confirm no artifact describes public sharing, multi-user accounts, hosted SaaS, professional DAM workflows, or full backup/restore as MVP scope in specs/002-mvp-next-steps/ and docs/
- [X] T066 Review and update Swagger/API documentation comments for new library endpoints in src/routes/library.routes.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; suggested MVP stopping point.
- **User Story 2 (Phase 4)**: Depends on Foundational and integrates best after US1 UI/list responses exist.
- **User Story 3 (Phase 5)**: Depends on Foundational; export is richer after US2 markers exist, but health can start independently.
- **Polish (Phase 6)**: Depends on implemented stories selected for release.

### User Story Dependencies

- **US1 - Personal Library Review Loop**: Required for MVP; no dependency on US2 or US3.
- **US2 - Lightweight Organization Markers**: Builds on US1 list/detail UI and responses, but marker APIs can be developed after Foundation.
- **US3 - Personal Data Confidence**: Health can start after Foundation; final export should include US2 markers when US2 is in release scope.

### Within Each User Story

- Write tests before implementation tasks in that story.
- Database/service support before route handlers.
- Route handlers before UI integration.
- UI state and rendering before final README/docs updates.
- Story checkpoint must pass before moving to the next priority if working sequentially.

---

## Parallel Opportunities

- T002, T003, and T004 can run in parallel after T001.
- T010 and T013 can run in parallel with migration design tasks T007 and T008 once T006 is complete.
- US1 test tasks T015-T018 can run in parallel.
- US1 UI structure tasks T026 and T027 can run in parallel with service/route implementation T019-T025.
- US2 test tasks T034-T036 can run in parallel.
- US3 test tasks T047-T050 can run in parallel.
- Documentation polish tasks T060-T062 can run in parallel after selected stories stabilize.

## Parallel Example: User Story 1

```text
Task: "T015 [P] [US1] Add contract tests for GET /api/library/assets filtering in tests/contract/library-assets.test.ts"
Task: "T016 [P] [US1] Add contract tests for GET /api/library/assets/:id detail response in tests/contract/library-asset-detail.test.ts"
Task: "T017 [P] [US1] Add integration test for import outcome aggregation in tests/integration/import-review-loop.test.ts"
Task: "T018 [P] [US1] Add integration test for delete behavior updating the library view in tests/integration/delete-review-loop.test.ts"
Task: "T026 [P] [US1] Create MVP UI shell and layout in src/ui/index.html"
Task: "T027 [P] [US1] Create MVP UI styles for import, filters, grid, detail, and fallback states in src/ui/styles.css"
```

## Parallel Example: User Story 2

```text
Task: "T034 [P] [US2] Add contract tests for PUT /api/library/assets/:id/favorite in tests/contract/library-favorite.test.ts"
Task: "T035 [P] [US2] Add contract tests for PUT /api/library/assets/:id/tags in tests/contract/library-tags.test.ts"
Task: "T036 [P] [US2] Add integration test for favorite/tag persistence and filtering in tests/integration/organization-markers.test.ts"
```

## Parallel Example: User Story 3

```text
Task: "T047 [P] [US3] Add contract tests for GET /api/library/health in tests/contract/library-health.test.ts"
Task: "T048 [P] [US3] Add contract tests for GET /api/library/export in tests/contract/library-export.test.ts"
Task: "T049 [P] [US3] Add integration test for missing original/thumbnail/metadata health states in tests/integration/library-health.test.ts"
Task: "T050 [P] [US3] Add integration test that exported summary excludes media bytes in tests/integration/library-export.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: US1 Personal Library Review Loop.
4. Stop and validate import, browse, filter, detail, and delete with the 20-file sample set.
5. Demo or release this as the first MVP slice if it is usable.

### Incremental Delivery

1. Setup + Foundation -> shared service, routing, migration, and UI shell ready.
2. US1 -> first useful MVP loop.
3. US2 -> personal organization with favorites/tags.
4. US3 -> trust surface with health and catalog export.
5. Polish -> docs, validation, and scope guardrails.

### Scope Guardrails

- Do not add multi-user identity, accounts, public sharing, hosted SaaS behavior, rights management, approval workflows, or full backup/restore in these tasks.
- Keep summary export as catalog and metadata index only; do not package original media files.
- Keep UI work focused on the operational media library screen, not a landing page.

## Task Counts

- Setup: 5 tasks
- Foundational: 9 tasks
- US1: 19 tasks
- US2: 13 tasks
- US3: 13 tasks
- Polish: 7 tasks
- Total: 66 tasks
