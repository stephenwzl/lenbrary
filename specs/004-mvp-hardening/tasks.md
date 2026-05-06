# Tasks: MVP Hardening

**Input**: Design documents from `/specs/004-mvp-hardening/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
**Additional Direction**: Replace the current static browser frontend with React while preserving the liquid glass operational style and local/private product scope.

**Tests**: Included because the specification requires real import reliability, repeatable browser acceptance evidence, batch/group/health contract coverage, and previous upload regressions escaped lower-level tests.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently after the shared React/API foundation is complete.

## Phase 1: Setup

**Purpose**: Align planning artifacts and repository structure with the React frontend requirement before feature work starts.

- [X] T001 Update `specs/004-mvp-hardening/plan.md` to replace the static UI assumption with a React frontend served by the existing app
- [X] T002 [P] Update `specs/004-mvp-hardening/research.md` with the decision to migrate the MVP UI to React for stateful import, selection, grouping, and acceptance workflows
- [X] T003 [P] Update `specs/004-mvp-hardening/contracts/ui-contract.md` to describe React-owned UI state while preserving liquid glass usability requirements
- [X] T004 [P] Update `specs/004-mvp-hardening/quickstart.md` with React build/dev validation steps and browser acceptance execution
- [X] T005 Update `package.json` with React, React DOM, Vite, React plugin, frontend build/dev scripts, and browser acceptance tooling
- [X] T006 Create React entry structure in `src/ui/react/` with `main.tsx`, `App.tsx`, `api.ts`, `types.ts`, and `styles.css`
- [X] T007 Replace `src/ui/index.html` with a React mount shell that loads the built React bundle and keeps basic no-script fallback text
- [X] T008 Update server static asset serving in `src/app.ts` so built React UI assets are served correctly in development and production
- [X] T009 Run baseline `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` from repository root and record any pre-existing failures in `specs/004-mvp-hardening/quickstart.md`

---

## Phase 2: Foundational

**Purpose**: Shared API, type, fixture, and React primitives that block all user stories.

**Critical**: No user story work should begin until this phase is complete.

- [X] T010 Define shared MVP hardening types for import outcomes, batch results, browse groups, health issues, and React view state in `src/types/library.types.ts`
- [X] T011 Define matching React client types and API request helpers in `src/ui/react/types.ts` and `src/ui/react/api.ts`
- [X] T012 Add fixture generation helpers for supported, duplicate, unsupported, damaged, zero-byte, and larger-boundary media cases in `tests/helpers/media-fixtures.ts`
- [X] T013 Create initial media fixture inventory documentation in `tests/fixtures/media/README.md`
- [X] T014 [P] Add contract assertions for import, batch, grouping, health issue, and export response shapes in `tests/contract/library-hardening-contract.test.ts`
- [X] T015 [P] Add React static/build contract coverage for the mount shell, liquid glass CSS hooks, and required page regions in `tests/contract/react-ui-static.test.ts`
- [X] T016 [P] Add browser acceptance test harness helper for starting the app and collecting failure evidence in `tests/acceptance/browser-harness.ts`
- [X] T017 Add reusable React layout, feedback, loading, empty-state, and liquid glass shell components in `src/ui/react/App.tsx` and `src/ui/react/styles.css`
- [X] T018 Update `tsconfig.json` to include React JSX and the new frontend source without weakening existing server type checks
- [X] T019 Update build output handling so `npm run build` compiles server code and React assets into the expected distributable locations in `package.json`

**Checkpoint**: React shell, shared contracts, fixtures, and build pipeline are ready; user story implementation can begin.

---

## Phase 3: User Story 1 - Reliable Real Media Import (Priority: P1) MVP

**Goal**: A user can import a realistic mixed set of personal photos and videos through the React page and receive a final visible result for every file.

**Independent Test**: Import the mixed fixture set through the page and confirm every row reaches accepted, duplicate, unsupported, or failed without generic crashes and with successful files visible in the library.

### Tests for User Story 1

- [X] T020 [P] [US1] Add integration coverage for `/api/library/import` real per-file outcomes in `tests/integration/library-import-hardening.test.ts`
- [X] T021 [P] [US1] Add regression coverage for PNG browser import success in `tests/integration/png-import-regression.test.ts`
- [X] T022 [P] [US1] Add React import queue state tests for queued, uploading, accepted, duplicate, unsupported, failed, and completed rows in `tests/unit/react-import-state.test.ts`
- [X] T023 [P] [US1] Add browser acceptance coverage for importing the mixed fixture set through the React UI in `tests/acceptance/import-reliability.acceptance.test.ts`

### Implementation for User Story 1

- [X] T024 [US1] Refactor asset upload processing into a reusable service method in `src/services/library.service.ts`
- [X] T025 [US1] Update `POST /api/library/import` in `src/routes/library.routes.ts` to process each uploaded file into accepted, duplicate, unsupported, or failed outcomes
- [X] T026 [US1] Record final per-file import events with status, message, asset id, metadata availability, and thumbnail availability in `src/services/database.service.ts`
- [X] T027 [US1] Normalize expected bad-file and unsupported-file errors so they do not become generic 500 responses in `src/routes/library.routes.ts`
- [X] T028 [US1] Implement React import queue upload orchestration and outcome rendering in `src/ui/react/App.tsx`
- [X] T029 [US1] Implement accepted and duplicate row actions that open the related asset detail in `src/ui/react/App.tsx`
- [X] T030 [US1] Implement import summary counters and failure guidance in `src/ui/react/App.tsx`
- [X] T031 [US1] Add liquid glass import queue, progress, and status styling in `src/ui/react/styles.css`
- [X] T032 [US1] Update legacy `src/ui/app.ts` and `src/ui/app.js` references or remove them from the served path so React is the single active frontend

**Checkpoint**: User Story 1 is independently functional and is the MVP hardening slice.

---

## Phase 4: User Story 2 - Browser-Based Regression Confidence (Priority: P1)

**Goal**: The MVP has a repeatable browser workflow that proves the visible user path works before claiming stability.

**Independent Test**: Run the browser acceptance workflow against a fresh library and confirm import, browsing, filtering, detail, favorite/tag, delete confirmation, health, and export complete with evidence.

### Tests for User Story 2

- [X] T033 [P] [US2] Add end-to-end MVP browser acceptance flow in `tests/acceptance/mvp-regression.acceptance.test.ts`
- [X] T034 [P] [US2] Add failure evidence assertions for step name, expected state, actual state, and visible message in `tests/unit/browser-evidence.test.ts`

### Implementation for User Story 2

- [X] T035 [US2] Implement browser acceptance step runner and artifact capture in `tests/acceptance/browser-harness.ts`
- [X] T036 [US2] Add React stable selectors and accessible labels for import, filters, detail, mutations, health, and export in `src/ui/react/App.tsx`
- [X] T037 [US2] Add deterministic test reset and seeded library helpers for browser acceptance in `tests/helpers/test-env.ts`
- [X] T038 [US2] Add npm script for browser acceptance execution in `package.json`
- [X] T039 [US2] Document browser acceptance usage and failure triage in `specs/004-mvp-hardening/quickstart.md`

**Checkpoint**: User Story 2 produces repeatable browser-path confidence for the current MVP.

---

## Phase 5: User Story 3 - Batch Organization for Personal Collections (Priority: P2)

**Goal**: A user can select multiple assets and apply tags, favorite state, or confirmed deletion without repetitive one-by-one edits.

**Independent Test**: Select at least 10 imported assets, batch tag them, batch favorite/unfavorite them, and delete a selected subset with confirmation while partial failures remain visible.

### Tests for User Story 3

- [X] T040 [P] [US3] Add contract tests for batch tag, favorite, and delete responses in `tests/contract/library-batch-actions.test.ts`
- [X] T041 [P] [US3] Add integration tests for batch partial success and missing asset handling in `tests/integration/library-batch-actions.test.ts`
- [X] T042 [P] [US3] Add React selection and batch result state tests in `tests/unit/react-selection-state.test.ts`

### Implementation for User Story 3

- [X] T043 [US3] Add batch tag, favorite, and delete service methods in `src/services/library.service.ts`
- [X] T044 [US3] Add batch tag, favorite, and confirmed delete routes in `src/routes/library.routes.ts`
- [X] T045 [US3] Add React multi-select state, selection count, and selection clearing in `src/ui/react/App.tsx`
- [X] T046 [US3] Add React batch tag controls and result feedback in `src/ui/react/App.tsx`
- [X] T047 [US3] Add React batch favorite and unfavorite controls with partial-result feedback in `src/ui/react/App.tsx`
- [X] T048 [US3] Add React batch delete confirmation that names the affected count in `src/ui/react/App.tsx`
- [X] T049 [US3] Add liquid glass selection and batch toolbar styling in `src/ui/react/styles.css`

**Checkpoint**: User Story 3 works independently on a populated library and preserves User Stories 1 and 2.

---

## Phase 6: User Story 4 - Timeline And Grouped Browsing (Priority: P2)

**Goal**: A user can browse assets by timeline, tag, or camera while preserving active filters and detail access.

**Independent Test**: Import assets with multiple dates, tags, and cameras; switch grouping modes; verify readable groups, preserved filters, and detail opening from grouped assets.

### Tests for User Story 4

- [X] T050 [P] [US4] Add contract tests for grouped listing response shapes in `tests/contract/library-grouped-listing.test.ts`
- [X] T051 [P] [US4] Add integration tests for timeline, tag, and camera grouping with existing filters in `tests/integration/library-grouped-listing.test.ts`
- [X] T052 [P] [US4] Add React grouping state tests for filter preservation and unknown buckets in `tests/unit/react-grouping-state.test.ts`

### Implementation for User Story 4

- [X] T053 [US4] Extend library filter parsing with `groupBy` support in `src/services/library.service.ts`
- [X] T054 [US4] Implement timeline, tag, camera, and flat grouping builders in `src/services/library.service.ts`
- [X] T055 [US4] Update `GET /api/library/assets` grouped response handling in `src/routes/library.routes.ts`
- [X] T056 [US4] Add React grouping controls and grouped asset rendering in `src/ui/react/App.tsx`
- [X] T057 [US4] Preserve active filters, pagination intent, and selected detail across grouping changes in `src/ui/react/App.tsx`
- [X] T058 [US4] Add liquid glass group header and grouped grid styling in `src/ui/react/styles.css`

**Checkpoint**: User Story 4 works independently on a populated library and does not regress flat browsing.

---

## Phase 7: User Story 5 - Actionable Data Confidence (Priority: P3)

**Goal**: A user can understand missing originals, thumbnails, metadata, duplicates, and export boundaries without mistaking the catalog for a media backup.

**Independent Test**: Seed confidence issues, open health status, verify severity and affected assets, then start export and confirm original-media exclusion messaging.

### Tests for User Story 5

- [X] T059 [P] [US5] Add contract tests for health issue detail and export exclusion fields in `tests/contract/library-health-confidence.test.ts`
- [X] T060 [P] [US5] Add integration tests for missing original, missing thumbnail, and missing metadata issue generation in `tests/integration/library-health-confidence.test.ts`
- [X] T061 [P] [US5] Add React health and export warning state tests in `tests/unit/react-health-export-state.test.ts`

### Implementation for User Story 5

- [X] T062 [US5] Extend health issue types and severity mapping in `src/types/library.types.ts`
- [X] T063 [US5] Implement affected asset context and recommended actions in `src/services/library.service.ts`
- [X] T064 [US5] Update `GET /api/library/health` to include actionable issue rows in `src/routes/library.routes.ts`
- [X] T065 [US5] Ensure summary export includes catalog-only exclusion and health context in `src/services/library.service.ts`
- [X] T066 [US5] Add React health issue rendering with severity, affected context, and recommended action in `src/ui/react/App.tsx`
- [X] T067 [US5] Add React export preflight warning that originals are excluded in `src/ui/react/App.tsx`
- [X] T068 [US5] Add liquid glass health issue and export warning styling in `src/ui/react/styles.css`

**Checkpoint**: User Story 5 works independently and reinforces MVP data trust boundaries.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, migration cleanup, full validation, and scope guardrails.

- [X] T069 [P] Update `README.md` with React UI, MVP hardening scope, browser acceptance, and import reliability notes
- [X] T070 [P] Update `docs/product.md` with MVP hardening priorities, batch organization, grouping, and data confidence boundaries
- [X] T071 [P] Update `docs/architecture.md` with React frontend build/serve architecture and library hardening contracts
- [X] T072 Remove or archive obsolete static UI tests and source references that no longer apply in `tests/contract/ui-static.test.ts`
- [X] T073 Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and the browser acceptance script from repository root
- [X] T074 Execute `specs/004-mvp-hardening/quickstart.md` end to end and update any stale validation instructions
- [X] T075 Verify no changes introduce public sharing, multi-user accounts, hosted collaboration, professional DAM workflows, or backup/restore claims in `specs/004-mvp-hardening/`, `docs/`, and `src/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Story 1 (Phase 3, P1)**: Depends on Foundational; first MVP hardening slice.
- **User Story 2 (Phase 4, P1)**: Depends on Foundational and benefits from US1 import UI, but its harness can begin after React shell exists.
- **User Story 3 (Phase 5, P2)**: Depends on Foundational; should land after US1 to reuse imported populated library behavior.
- **User Story 4 (Phase 6, P2)**: Depends on Foundational; can run after or alongside US3 if service/UI file edits are coordinated.
- **User Story 5 (Phase 7, P3)**: Depends on Foundational; can run after US1 fixture and health foundations exist.
- **Polish (Phase 8)**: Depends on all selected user stories.

### User Story Dependencies

- **US1 Reliable Real Media Import**: No dependency on later stories and is the minimum MVP hardening deliverable.
- **US2 Browser-Based Regression Confidence**: Should validate US1 once US1 exists, but the harness and evidence model can be built independently.
- **US3 Batch Organization**: Requires populated assets and React selection primitives from Foundation.
- **US4 Timeline And Grouped Browsing**: Requires listing/filtering and React view state from Foundation.
- **US5 Actionable Data Confidence**: Requires library health/export surfaces and asset fixtures from Foundation.

### Within Each User Story

- Write tests first and confirm they fail for missing behavior.
- Update shared types before service or UI code that consumes them.
- Implement service behavior before route response wiring.
- Implement React state before rendering controls.
- Add styling after behavior renders stable DOM.
- Validate the story independently before proceeding to the next priority.

## Parallel Opportunities

- T002, T003, and T004 can run in parallel after T001 direction is known.
- T014, T015, and T016 can run in parallel after shared type names are defined.
- Tests within each user story marked `[P]` can run in parallel.
- Documentation updates T069, T070, and T071 can run in parallel during polish.
- US3, US4, and US5 can be parallelized after US1/US2 if workers coordinate edits to `src/ui/react/App.tsx` and `src/services/library.service.ts`.

## Parallel Example: User Story 1

```text
Task: T020 [P] [US1] Add integration coverage for /api/library/import real per-file outcomes in tests/integration/library-import-hardening.test.ts
Task: T021 [P] [US1] Add regression coverage for PNG browser import success in tests/integration/png-import-regression.test.ts
Task: T022 [P] [US1] Add React import queue state tests for queued, uploading, accepted, duplicate, unsupported, failed, and completed rows in tests/unit/react-import-state.test.ts
Task: T023 [P] [US1] Add browser acceptance coverage for importing the mixed fixture set through the React UI in tests/acceptance/import-reliability.acceptance.test.ts
```

## Parallel Example: User Story 3

```text
Task: T040 [P] [US3] Add contract tests for batch tag, favorite, and delete responses in tests/contract/library-batch-actions.test.ts
Task: T041 [P] [US3] Add integration tests for batch partial success and missing asset handling in tests/integration/library-batch-actions.test.ts
Task: T042 [P] [US3] Add React selection and batch result state tests in tests/unit/react-selection-state.test.ts
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 / US1.
3. Stop and validate real browser import reliability with the mixed fixture set.
4. Complete Phase 4 / US2 to make the browser regression workflow repeatable.
5. Demo only after US1 and US2 pass locally.

### Incremental Delivery

1. React foundation and contracts.
2. Real import reliability.
3. Browser acceptance confidence.
4. Batch organization.
5. Grouped browsing.
6. Actionable health/export data confidence.
7. Documentation, validation, and scope guardrail review.

### Scope Guardrail

This task list must not introduce public sharing, multi-user collaboration, hosted accounts, professional review workflows, or full backup/restore behavior. The product remains a personal photography/media asset management tool for a trusted private environment.
