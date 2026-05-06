# Tasks: Project Knowledge Docs

**Input**: Design documents from `/specs/001-project-knowledge-docs/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated application tests are required because this is a documentation-only feature. Validation tasks use Markdown review, placeholder scans, and evidence-trace checks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create documentation workspace and collect source evidence used by all stories.

- [X] T001 Create documentation directory `docs/`
- [X] T002 Create evidence notes section skeleton in `docs/project-knowledge.md`
- [X] T003 [P] Capture repository quickstart and existing capability evidence from `README.md` for later use in `docs/project-knowledge.md`
- [X] T004 [P] Capture package, command, and runtime evidence from `package.json` for later use in `docs/architecture.md`
- [X] T005 [P] Capture deployment and operations evidence from `Dockerfile`, `docker-compose.yml`, and `Makefile` for later use in `docs/architecture.md`
- [X] T006 [P] Capture source responsibility evidence from `src/app.ts`, `src/routes/`, `src/services/`, `src/types/`, and `src/migrations/` for later use across `docs/project-knowledge.md` and `docs/architecture.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define shared documentation conventions and quality controls that all user-story documents must follow.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Define shared evidence-status language in `docs/project-knowledge.md` covering verified facts, assumptions, open questions, and recommended decisions
- [X] T008 Define shared maintenance metadata format in `docs/project-knowledge.md` including audience, last reviewed date, scope, non-scope, and update triggers
- [X] T009 Create shared vocabulary baseline in `docs/project-knowledge.md` for asset, metadata, thumbnail, duplicate, storage, migration, and endpoint documentation
- [X] T010 Confirm documentation-only constraints in `docs/project-knowledge.md` stating that this feature does not change runtime behavior, external contracts, schema, or deployment configuration

**Checkpoint**: Shared documentation conventions are ready and user-story documents can now be implemented.

---

## Phase 3: User Story 1 - Establish Shared Project Understanding (Priority: P1) MVP

**Goal**: Deliver `docs/project-knowledge.md` so a new contributor can understand Lenbrary's purpose, current capabilities, vocabulary, limits, risks, and open questions without reading source code.

**Independent Test**: Give `docs/project-knowledge.md` to a new contributor and verify they can explain the project purpose, primary users, current capabilities, non-goals, and open business questions without reading source code.

### Implementation for User Story 1

- [X] T011 [US1] Write project purpose and intended audience in `docs/project-knowledge.md`
- [X] T012 [US1] Document current capability summary in `docs/project-knowledge.md` covering media upload, image and video support, duplicate detection, thumbnail generation, image EXIF metadata, video metadata, asset listing and retrieval, deletion, local persistence, migrations, and endpoint documentation
- [X] T013 [US1] Expand domain vocabulary definitions in `docs/project-knowledge.md` using the shared vocabulary baseline from T009
- [X] T014 [US1] Document current limitations and non-goals in `docs/project-knowledge.md`, including undefined security, identity, sharing, backup, retention, and compliance posture
- [X] T015 [US1] Document risks and operational dependencies in `docs/project-knowledge.md`, including local file persistence, media metadata availability, and external media-processing tool dependency
- [X] T016 [US1] Add repository evidence map in `docs/project-knowledge.md` referencing `README.md`, `package.json`, `src/app.ts`, `src/routes/`, `src/services/`, `src/types/`, `src/migrations/`, `Dockerfile`, `docker-compose.yml`, and `Makefile`
- [X] T017 [US1] Add project-baseline review prompts in `docs/project-knowledge.md` so maintainers can validate whether a reader understands the project

**Checkpoint**: User Story 1 is complete when `docs/project-knowledge.md` can stand alone as the project understanding baseline.

---

## Phase 4: User Story 2 - Create Portable Product Documentation (Priority: P2)

**Goal**: Deliver `docs/product.md` so stakeholders can reason about the photography/media enthusiast target user, workflows, value proposition, feature boundaries, business objectives, and unresolved goal decisions.

**Independent Test**: Ask stakeholders to identify the intended audience, top workflows, current product promises, out-of-scope expectations, and unresolved goal questions from `docs/product.md` alone.

### Implementation for User Story 2

- [X] T018 [P] [US2] Create product document structure in `docs/product.md` with title, purpose, audience, last reviewed date, scope, non-scope, verified facts, assumptions, open questions, and maintenance guidance
- [X] T019 [US2] Document product positioning and value proposition in `docs/product.md` using the current baseline of personal photography/media asset management
- [X] T020 [US2] Document target user segments and primary workflows in `docs/product.md`, including media ingestion, duplicate avoidance, metadata review, asset browsing, retrieval, and deletion
- [X] T021 [US2] Define at least three measurable business objectives in `docs/product.md` with indicators and evidence needed
- [X] T022 [US2] Document scope boundaries and non-goals in `docs/product.md`, including multi-tenant hosting, user identity, remote sharing, backup policy, retention policy, and compliance unless later clarified
- [X] T023 [US2] Add roadmap decision criteria in `docs/product.md` for classifying proposed work as in scope, out of scope, or needing clarification
- [X] T024 [US2] Add at least five business-goal clarification questions in `docs/product.md` with recommended defaults, alternatives, implications, and priority
- [X] T025 [US2] Add stakeholder review prompts in `docs/product.md` for validating business goals, target audience, workflow priority, and scope boundaries

**Checkpoint**: User Story 2 is complete when `docs/product.md` supports roadmap and scope decisions without requiring repository code reading.

---

## Phase 5: User Story 3 - Create Portable Architecture Documentation (Priority: P3)

**Goal**: Deliver `docs/architecture.md` so engineers and maintainers can understand system responsibilities, data concepts, asset lifecycle, operational dependencies, deployment context, and known risks.

**Independent Test**: Ask an engineer to locate upload, storage, metadata, migration, asset access, and deployment responsibilities using `docs/architecture.md`, then confirm the document aligns with the repository at the time of writing.

### Implementation for User Story 3

- [X] T026 [P] [US3] Create architecture document structure in `docs/architecture.md` with title, purpose, audience, last reviewed date, scope, non-scope, verified facts, assumptions, open questions, and maintenance guidance
- [X] T027 [US3] Document system overview and major responsibilities in `docs/architecture.md` covering routing, upload handling, storage, metadata extraction, persistence, endpoint documentation, logging, migrations, and deployment
- [X] T028 [US3] Document asset lifecycle in `docs/architecture.md` from upload through type detection, duplicate check, storage, thumbnail generation, metadata extraction, listing, retrieval, and deletion
- [X] T029 [US3] Document data concepts in `docs/architecture.md` for asset, image metadata, video metadata, file hash, stored file, thumbnail, and migration record
- [X] T030 [US3] Document operational dependencies and deployment context in `docs/architecture.md`, including local directories, database file, temporary upload storage, media-processing tools, container runtime, and environment configuration
- [X] T031 [US3] Document cross-cutting concerns in `docs/architecture.md`, including logging, error handling, CORS, generated endpoint documentation, deduplication, and data migration
- [X] T032 [US3] Document at least five known architecture risks or constraints in `docs/architecture.md`, including local persistence risks, media-processing failure modes, metadata variability, undefined auth/security posture, backup expectations, and schema drift
- [X] T033 [US3] Add architecture review prompts in `docs/architecture.md` for future capability, schema, deployment, and security changes

**Checkpoint**: User Story 3 is complete when `docs/architecture.md` can guide future planning without becoming a line-by-line source-code walkthrough.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate consistency, traceability, and readiness across all documentation deliverables.

- [X] T034 [P] Cross-check `docs/project-knowledge.md` against `docs/product.md` for consistent audience, product positioning, scope boundaries, and open questions
- [X] T035 [P] Cross-check `docs/project-knowledge.md` against `docs/architecture.md` for consistent capability names, vocabulary, risks, and evidence references
- [X] T036 [P] Verify `docs/product.md` contains at least three measurable business objectives and at least five unresolved product or business decisions
- [X] T037 [P] Verify `docs/architecture.md` covers upload handling, storage, metadata extraction, persistence, routing, endpoint documentation, logging, migrations, and deployment
- [X] T038 Run placeholder scan with `rg "TODO|TBD|NEEDS CLARIFICATION|\\[.*\\]" docs` and resolve any unresolved placeholders in `docs/project-knowledge.md`, `docs/product.md`, and `docs/architecture.md`
- [X] T039 Verify all current-capability claims in `docs/project-knowledge.md`, `docs/product.md`, and `docs/architecture.md` are traceable to repository evidence or explicitly marked as assumptions
- [X] T040 Update `README.md` with a concise link to `docs/project-knowledge.md`, `docs/product.md`, and `docs/architecture.md`
- [X] T041 Run final documentation acceptance review using `specs/001-project-knowledge-docs/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 evidence capture; blocks all user-story work.
- **User Story 1 (Phase 3)**: Depends on Phase 2; delivers the MVP project understanding baseline.
- **User Story 2 (Phase 4)**: Depends on Phase 2; can proceed independently after foundational conventions exist, but benefits from US1 vocabulary.
- **User Story 3 (Phase 5)**: Depends on Phase 2; can proceed independently after foundational conventions exist.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2; no dependency on US2 or US3.
- **US2 (P2)**: Can start after Phase 2; no hard dependency on US1, though using US1 vocabulary improves consistency.
- **US3 (P3)**: Can start after Phase 2; no hard dependency on US1 or US2.

### Parallel Opportunities

- T003, T004, T005, and T006 can run in parallel because they gather evidence from different files.
- T018 and T026 can run in parallel because they create different documents.
- US2 and US3 can run in parallel after Phase 2 if separate contributors own `docs/product.md` and `docs/architecture.md`.
- T034, T035, T036, and T037 can run in parallel during polish because they inspect different consistency dimensions.

---

## Parallel Example: User Story 2

```bash
Task: "Create product document structure in docs/product.md"
Task: "Create architecture document structure in docs/architecture.md"
```

After `docs/product.md` exists, the following can be assigned as a focused product-document batch:

```bash
Task: "Document target user segments and primary workflows in docs/product.md"
Task: "Define at least three measurable business objectives in docs/product.md"
Task: "Add at least five business-goal clarification questions in docs/product.md"
```

---

## Parallel Example: User Story 3

After `docs/architecture.md` exists, different contributors can draft independent sections:

```bash
Task: "Document asset lifecycle in docs/architecture.md"
Task: "Document data concepts in docs/architecture.md"
Task: "Document operational dependencies and deployment context in docs/architecture.md"
Task: "Document at least five known architecture risks or constraints in docs/architecture.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup and evidence capture.
2. Complete Phase 2 shared documentation conventions.
3. Complete Phase 3 `docs/project-knowledge.md`.
4. Stop and validate that a new contributor can understand project purpose, current capabilities, vocabulary, non-goals, and open questions from `docs/project-knowledge.md`.

### Incremental Delivery

1. Deliver US1 as the shared project understanding baseline.
2. Add US2 to make business goals, target users, workflows, and scope decisions explicit.
3. Add US3 to make technical responsibilities, lifecycle, dependencies, and risks explicit.
4. Run Phase 6 polish to align terminology, evidence, and maintenance guidance across all documents.

### Parallel Team Strategy

With multiple contributors:

1. One contributor completes Phase 1 and Phase 2.
2. Contributor A owns `docs/project-knowledge.md`.
3. Contributor B owns `docs/product.md`.
4. Contributor C owns `docs/architecture.md`.
5. All contributors participate in Phase 6 consistency checks.

## Notes

- Every task includes an exact file path or command target.
- `[P]` tasks are safe to run in parallel because they touch different files or inspect independent concerns.
- User-story labels map directly to the feature specification stories.
- Runtime behavior, external contracts, schema, and deployment configuration must remain unchanged.
