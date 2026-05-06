# Tasks: Frontend API Polish

**Input**: Design documents from `/specs/003-frontend-api-polish/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
**Visual Direction**: The UI must use a liquid glass style: translucent layered surfaces, backdrop blur, specular highlight borders, soft depth shadows, clear focus states, restrained motion, and readable contrast on desktop and mobile-width layouts.

**Tests**: Included because `plan.md` requires targeted UI contract/integration tests and the current feature is a visible UI workflow with previous upload regression risk.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Phase 1: Setup

**Purpose**: Align the current artifacts with the liquid glass visual requirement and establish baseline checks before editing UI behavior.

- [X] T001 Update `specs/003-frontend-api-polish/spec.md` to record the liquid glass visual style as a required UI quality constraint without expanding product scope.
- [X] T002 Update `specs/003-frontend-api-polish/plan.md` to include liquid glass as the visual implementation direction and responsive QA gate.
- [X] T003 Update `specs/003-frontend-api-polish/contracts/ui-contract.md` with liquid glass surface, contrast, focus, motion, and mobile stacking expectations.
- [X] T004 [P] Update `specs/003-frontend-api-polish/quickstart.md` with a visual QA step for translucent layers, blur, highlight borders, depth, and readability.
- [X] T005 [P] Inspect current `src/ui/index.html`, `src/ui/app.ts`, `src/ui/app.js`, and `src/ui/styles.css` to identify existing controls, duplicated JS/TS behavior, and styling boundaries.
- [X] T006 Run baseline validation commands from repository root: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

---

## Phase 2: Foundational

**Purpose**: Create shared UI structure, state boundaries, tests, and liquid glass primitives that block all user stories.

**Critical**: No user story work should begin until this phase is complete.

- [X] T007 Define shared client state shapes for Library View State, Filter Set, Import Queue Item, Asset Detail Panel, Feedback Message, and Responsive Layout State in `src/ui/app.ts` and mirror behavior in `src/ui/app.js`.
- [X] T008 Add stable page regions for global feedback, import queue, filter bar, active filters, asset results, asset detail, library health, and export actions in `src/ui/index.html`.
- [X] T009 Add filter controls for media type, favorite state, tags, camera text, date range, thumbnail availability, metadata availability, clear-one, and clear-all in `src/ui/index.html`.
- [X] T010 Add incremental loading controls and result count affordances in `src/ui/index.html`.
- [X] T011 Add import queue container and per-file status regions for queued, uploading, accepted, duplicate, unsupported, failed, and completed states in `src/ui/index.html`.
- [X] T012 [P] Add liquid glass base design tokens, surface classes, blur layers, highlight borders, depth shadows, semantic status colors, and focus rings in `src/ui/styles.css`.
- [X] T013 [P] Add contract coverage for library listing pagination/filter expectations in `tests/contract/library-assets.test.ts`.
- [X] T014 [P] Add static UI contract coverage for required HTML regions and controls in `tests/contract/ui-static.test.ts`.

**Checkpoint**: Foundation ready; user story implementation can begin.

---

## Phase 3: User Story 1 - Complete Library Control Surface (Priority: P1) MVP

**Goal**: A user can browse, filter, load more, inspect detail, open originals/thumbnails where available, favorite, tag, delete, view health, and export from the page alone.

**Independent Test**: Start with a populated library, apply multiple filters, clear one filter, load more results, open an asset detail, favorite/tag/delete an asset, view health, and trigger export without using endpoint documentation.

### Tests for User Story 1

- [X] T015 [P] [US1] Add unit tests for filter state, active chip generation, and query generation in `tests/unit/ui-state.test.ts`.
- [X] T016 [P] [US1] Add integration coverage for paginated filtered listing behavior in `tests/integration/frontend-control-surface.test.ts`.

### Implementation for User Story 1

- [X] T017 [US1] Implement client filter state, query generation, and filter reset behavior in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T018 [US1] Render active filter chips with individual clear actions and clear-all support in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T019 [US1] Wire date range, thumbnail availability, metadata availability, media type, favorite, tag, and camera filters to library reload behavior in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T020 [US1] Implement load-more behavior that preserves active filters and selected asset context in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T021 [US1] Update asset card rendering with health severity, favorite state, tag chips, dates, media type, and useful camera metadata in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T022 [US1] Implement grouped asset detail sections for file facts, availability, duplicate identity, photo metadata, video metadata, organization, favorite state, tags, original access, and delete controls in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T023 [US1] Add original-file and thumbnail availability messaging, including stronger missing-original warnings, in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T024 [US1] Add liquid glass styling for toolbar, filters, active chips, asset cards, detail panel, status panel, and export panel in `src/ui/styles.css`.
- [X] T025 [US1] Add visible success/failure feedback for favorite, tag, delete, status, export, and detail-loading actions in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T026 [US1] Ensure delete confirmation names the selected asset and refreshes results without losing the user's broader filter context in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T027 [US1] Update `README.md` with the enhanced page capabilities, personal-product positioning, and liquid glass UI note.

**Checkpoint**: User Story 1 is independently functional and is the MVP slice.

---

## Phase 4: User Story 2 - Import Workflow With Clear Progress And Outcomes (Priority: P2)

**Goal**: A user importing mixed personal media can see per-file progress, duplicate recognition, unsupported-file handling, failure messages, and successful library updates.

**Independent Test**: Select a mixed file set with valid media, duplicate media, and unsupported files; every file receives a visible outcome and successful imports remain usable.

### Tests for User Story 2

- [X] T028 [P] [US2] Add integration coverage for mixed import outcomes and continued library usability in `tests/integration/import-review-loop.test.ts`.
- [X] T029 [P] [US2] Add static UI contract coverage for import queue states in `tests/contract/ui-static.test.ts`.

### Implementation for User Story 2

- [X] T030 [US2] Replace the simple import result list with an import queue state model in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T031 [US2] Render queued, uploading, accepted, duplicate, unsupported, failed, and completed import item states in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T032 [US2] Link accepted and duplicate import outcomes to the created or existing asset detail when an asset id is available in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T033 [US2] Add user-facing retry or continue guidance for failed and unsupported files in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T034 [US2] Keep successfully imported assets visible and refresh the library without hiding failed import queue items in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T035 [US2] Add import progress summary counters for total, queued, uploading, accepted, duplicate, unsupported, failed, and completed items in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T036 [US2] Add liquid glass import queue styling, progress strips, semantic outcome colors, and readable compact item rows in `src/ui/styles.css`.

**Checkpoint**: User Story 2 works independently and preserves User Story 1 behavior.

---

## Phase 5: User Story 3 - UI Quality And Interaction Ergonomics (Priority: P3)

**Goal**: The interface is organized, responsive, readable, safe for destructive actions, and visually coherent in liquid glass style across empty, loading, error, populated, missing-preview, and missing-metadata states.

**Independent Test**: Use the page at desktop and mobile-width layouts across empty, loading, error, no-results, missing-preview, missing-original, missing-metadata, and populated states with no overlapping controls or unreadable critical labels.

### Tests for User Story 3

- [X] T037 [P] [US3] Add responsive DOM/static assertions for required regions, labels, and destructive confirmations in `tests/contract/ui-static.test.ts`.
- [X] T038 [P] [US3] Add integration coverage for health and export feedback behavior in `tests/integration/frontend-ergonomics.test.ts`.

### Implementation for User Story 3

- [X] T039 [US3] Implement a reusable global feedback message renderer for success, warning, error, empty, loading, and no-results states in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T040 [US3] Implement clear empty, loading, error, no-results, missing-preview, missing-metadata, and missing-original render states across library, detail, status, import, and export UI in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T041 [US3] Render library health severity differences for missing originals, missing thumbnails, and missing metadata with affected asset context where available in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T042 [US3] Add export preflight messaging that the summary export excludes original media files before download starts in `src/ui/app.ts` and `src/ui/app.js`.
- [X] T043 [US3] Refine desktop, tablet, and mobile-width layout rules for control density, grid/list behavior, detail placement, and panel spacing in `src/ui/styles.css`.
- [X] T044 [US3] Add liquid glass mobile stacking, safe spacing, stable button dimensions, readable chip wrapping, and non-overlapping detail fields in `src/ui/styles.css`.
- [X] T045 [US3] Add hover, active, keyboard focus, reduced-motion, and loading shimmer states for liquid glass controls and panels in `src/ui/styles.css`.
- [X] T046 [US3] Add accessible labels, live-region semantics, status semantics, and destructive-action labeling for filters, import queue, feedback, export, and delete controls in `src/ui/index.html`, `src/ui/app.ts`, and `src/ui/app.js`.
- [X] T047 [US3] Ensure card titles, button labels, filter chips, metadata fields, and status messages wrap or clamp without hiding critical text in `src/ui/styles.css`.

**Checkpoint**: All user stories are independently functional and visually coherent.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, regression checks, quickstart validation, and scope guardrails.

- [X] T048 [P] Update `docs/product.md` with the enhanced frontend capability scope and liquid glass interaction direction.
- [X] T049 [P] Update `docs/architecture.md` with the enhanced static UI state model, API-backed page behavior, and `src/ui/app.ts` / `src/ui/app.js` synchronization note.
- [X] T050 [P] Update `docs/project-knowledge.md` with current frontend capabilities, MVP boundary, and personal media library positioning.
- [X] T051 Verify `src/ui/app.ts` and `src/ui/app.js` remain behaviorally synchronized after all UI edits.
- [X] T052 Run final validation commands from repository root: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
- [X] T053 Execute the workflow in `specs/003-frontend-api-polish/quickstart.md` using a desktop-width browser.
- [X] T054 Execute the workflow in `specs/003-frontend-api-polish/quickstart.md` using a mobile-width browser.
- [X] T055 Verify liquid glass visual requirements in `src/ui/styles.css`: translucent layering, backdrop blur, highlight borders, depth, readable contrast, reduced-motion behavior, and no mobile overlap.
- [X] T056 Confirm no artifacts or UI changes add public sharing, multi-user accounts, SaaS hosting, professional DAM review workflows, or full media backup/restore scope in `specs/003-frontend-api-polish/`, `docs/`, and `src/ui/`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Story 1 (Phase 3, P1)**: Depends on Foundational; delivers MVP.
- **User Story 2 (Phase 4, P2)**: Depends on Foundational; can run after or in parallel with US1 if coordination keeps shared files synchronized.
- **User Story 3 (Phase 5, P3)**: Depends on Foundational; can run after or in parallel with US1/US2 if CSS and accessibility edits are coordinated.
- **Polish (Phase 6)**: Depends on the selected user stories being complete.

### User Story Dependencies

- **US1** has no dependency on US2 or US3 and is the first demoable MVP slice.
- **US2** depends on shared import queue regions and feedback primitives from Foundation, but should not depend on US1 internals beyond shared state helpers.
- **US3** depends on shared UI regions and visual tokens from Foundation, then improves cross-state responsiveness and safety.

### Within Each User Story

- Write tests first and confirm they fail for missing behavior.
- Update `src/ui/app.ts` and `src/ui/app.js` together for every client behavior change.
- Implement state changes before rendering changes.
- Implement rendering before styling refinements.
- Validate each story independently before starting broad polish.

---

## Parallel Opportunities

- T004 and T005 can run in parallel after T001-T003 are scoped.
- T012, T013, and T014 can run in parallel after the HTML regions from T008-T011 are understood.
- T015 and T016 can run in parallel for US1 tests.
- T028 and T029 can run in parallel for US2 tests.
- T037 and T038 can run in parallel for US3 tests.
- T048, T049, and T050 can run in parallel during polish.

---

## Parallel Example: User Story 1

```text
Task: T015 [P] [US1] Add unit tests for filter state, active chip generation, and query generation in tests/unit/ui-state.test.ts
Task: T016 [P] [US1] Add integration coverage for paginated filtered listing behavior in tests/integration/frontend-control-surface.test.ts
```

---

## Parallel Example: User Story 2

```text
Task: T028 [P] [US2] Add integration coverage for mixed import outcomes and continued library usability in tests/integration/import-review-loop.test.ts
Task: T029 [P] [US2] Add static UI contract coverage for import queue states in tests/contract/ui-static.test.ts
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 / US1.
3. Stop and validate browse, filter, load more, detail, favorite, tag, delete, health, export, and liquid glass readability.
4. Demo the MVP slice before expanding import and broader ergonomics.

### Incremental Delivery

1. Foundation: shared state, page regions, liquid glass primitives, and baseline tests.
2. US1: complete library control surface.
3. US2: clear import queue and mixed upload outcomes.
4. US3: responsive, accessible, safe, polished liquid glass ergonomics.
5. Polish: docs, quickstart validation, full test/build pass, and scope guardrails.

### Scope Guardrail

This task list must not introduce public sharing, multi-user collaboration, hosted accounts, professional review workflows, or full backup/restore behavior. The product remains a personal photography/media asset management tool for a trusted private environment.
