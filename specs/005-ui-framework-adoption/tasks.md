# Tasks: UI 框架采纳与前端重构

**Input**: Design documents from `/specs/005-ui-framework-adoption/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui-contract.md, quickstart.md

**Tests**: Included because the specification requires verification that liquid glass visual identity survives the framework migration, all interactive states are covered, and `window.confirm` is eliminated.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently after the shared Tailwind/shadcn foundation is complete.

## Phase 1: Setup

**Purpose**: Install Tailwind CSS v4, shadcn/ui, and configure the build toolchain before any component work begins.

- [X] T001 Install Tailwind CSS v4 and Vite plugin in `package.json` (`tailwindcss`, `@tailwindcss/vite`)
- [X] T002 [P] Install shadcn/ui runtime dependencies in `package.json` (`class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `sonner`)
- [X] T003 Add `@/` path alias to `vite.config.ts` (`resolve.alias`) and `tsconfig.json` (`compilerOptions.paths` pointing to `./src/ui/react/*`)
- [X] T004 Add `@tailwindcss/vite` plugin to `vite.config.ts`
- [X] T005 Create `src/ui/react/lib/utils.ts` with the `cn()` helper function (clsx + tailwind-merge)
- [X] T006 Create `src/ui/react/globals.css` with Tailwind `@import "tailwindcss"` directive and CSS variable theme tokens from `data-model.md` (background, foreground, card, primary, secondary, muted, accent, destructive, border, input, ring, glass-*, status-*)
- [X] T007 Update `src/ui/react/main.tsx` to import `./globals.css` instead of `./styles.css`
- [X] T008 Run `npx shadcn@latest init` with the project's `components.json` configured for the `src/ui/react/` path structure and `@/` alias
- [X] T009 Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` to record baseline status in `specs/005-ui-framework-adoption/quickstart.md`

---

## Phase 2: Foundational

**Purpose**: Shared shadcn/ui components, custom Hooks, and layout primitives that block all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T010 Add shadcn/ui Button component to `src/ui/react/components/ui/button.tsx` with liquid glass variant styling (semi-transparent bg, backdrop-blur on hover, glass border)
- [X] T011 [P] Add shadcn/ui Input component to `src/ui/react/components/ui/input.tsx` with glass-styled focus ring matching `--ring` token
- [X] T012 [P] Add shadcn/ui Select component to `src/ui/react/components/ui/select.tsx` with glass-styled dropdown overlay
- [X] T013 [P] Add shadcn/ui Checkbox component to `src/ui/react/components/ui/checkbox.tsx` with glass-styled checked state
- [X] T014 [P] Add shadcn/ui Badge component to `src/ui/react/components/ui/badge.tsx` with status color variants (success, info, warning, danger)
- [X] T015 [P] Add shadcn/ui Card component to `src/ui/react/components/ui/card.tsx` with `.glass-panel` styling as default variant
- [X] T016 [P] Add shadcn/ui Skeleton component to `src/ui/react/components/ui/skeleton.tsx`
- [X] T017 [P] Add shadcn/ui Separator component to `src/ui/react/components/ui/separator.tsx`
- [X] T018 [P] Add shadcn/ui Tooltip component to `src/ui/react/components/ui/tooltip.tsx`
- [X] T019 [P] Add shadcn/ui Progress component to `src/ui/react/components/ui/progress.tsx`
- [X] T020 [P] Add shadcn/ui Dialog component to `src/ui/react/components/ui/dialog.tsx` with glass-styled overlay and content panel
- [X] T021 [P] Add shadcn/ui AlertDialog component to `src/ui/react/components/ui/alert-dialog.tsx` with glass-styled destructive action button
- [X] T022 [P] Add shadcn/ui Sheet component to `src/ui/react/components/ui/sheet.tsx` with glass-styled side panel
- [X] T023 [P] Add shadcn/ui Popover component to `src/ui/react/components/ui/popover.tsx` with glass-styled content
- [X] T024 [P] Add shadcn/ui Command component to `src/ui/react/components/ui/command.tsx` with glass-styled search input and list
- [X] T025 [P] Add shadcn/ui Calendar component to `src/ui/react/components/ui/calendar.tsx` with glass-styled day cells
- [X] T026 [P] Add shadcn/ui Accordion component to `src/ui/react/components/ui/accordion.tsx` with glass-styled item panels
- [X] T027 [P] Add shadcn/ui Sonner (Toaster) component to `src/ui/react/components/ui/sonner.tsx` with glass-styled toast cards
- [X] T028 Extract `useLibrary` Hook from App.tsx state into `src/ui/react/hooks/use-library.ts` (assets, groups, loading, refreshLibrary)
- [X] T029 [P] Extract `useImport` Hook from App.tsx state into `src/ui/react/hooks/use-import.ts` (importQueue, importSummary, handleImport)
- [X] T030 [P] Extract `useSelection` Hook from App.tsx state into `src/ui/react/hooks/use-selection.ts` (selectedIds, selectedAsset, toggleSelection, openDetail, batch operations)
- [X] T031 [P] Extract `useFilters` Hook from App.tsx state into `src/ui/react/hooks/use-filters.ts` (filters, activeFilterCount, updateFilter, clearFilters)
- [X] T032 [P] Extract `useHealth` Hook from App.tsx state into `src/ui/react/hooks/use-health.ts` (health, refreshHealth)
- [X] T033 Create AppShell layout component in `src/ui/react/components/layout/app-shell.tsx` with responsive three-column CSS Grid (sidebar | content | detail) using Tailwind breakpoints (lg: 1050px, sm: 680px)
- [X] T034 Create Sidebar layout component in `src/ui/react/components/layout/sidebar.tsx` with glass-panel styling and slot for filter/import content
- [X] T035 [P] Create ContentArea layout component in `src/ui/react/components/layout/content-area.tsx` with slot for import queue, batch toolbar, and asset grid
- [X] T036 [P] Create DetailPanel layout component in `src/ui/react/components/layout/detail-panel.tsx` with glass-panel styling, desktop sticky position, and mobile Sheet integration
- [X] T037 Add `prefers-reduced-motion` media query to `src/ui/react/globals.css` disabling all transitions and animations
- [X] T038 Add `.glass-panel` utility class to `src/ui/react/globals.css` using CSS variable tokens (--glass-bg, --glass-border, --glass-shadow, --glass-blur, --glass-saturate)
- [X] T039 Update `tests/contract/react-ui-static.test.ts` to assert against `globals.css` for CSS variables (`--card`, `--border`, `--ring`, `--glass-blur`), `backdrop-filter`, and `prefers-reduced-motion`

**Checkpoint**: shadcn/ui components, custom Hooks, layout primitives, and glass theme are ready; user story implementation can begin.

---

## Phase 3: User Story 1 - 框架基础替换与视觉一致性 (Priority: P1) 🎯 MVP

**Goal**: Replace all native HTML elements with shadcn/ui components while preserving the liquid glass visual identity.

**Independent Test**: Open the app in dark theme; all panels show translucent gradient backgrounds, backdrop blur, highlight borders, and depth shadows; interactive elements have clear hover/focus/active states; focus rings are visible during keyboard Tab navigation; `prefers-reduced-motion` disables all animations.

### Implementation for User Story 1

- [X] T040 [US1] Refactor `src/ui/react/App.tsx` to use custom Hooks (useLibrary, useImport, useSelection, useFilters, useHealth) instead of inline useState calls
- [X] T041 [US1] Create filter-bar feature component in `src/ui/react/components/features/filter-bar.tsx` replacing native `<select>` and `<input>` with shadcn/ui Select and Input components
- [X] T042 [US1] Create import-queue feature component in `src/ui/react/components/features/import-queue.tsx` replacing native queue rows with Card + Badge + Progress components
- [X] T043 [US1] Create asset-grid feature component in `src/ui/react/components/features/asset-grid.tsx` replacing native `<article>` cards with Card + Checkbox components, including empty state
- [X] T044 [US1] Create batch-toolbar feature component in `src/ui/react/components/features/batch-toolbar.tsx` replacing native toolbar with Button + Input components
- [X] T045 [US1] Create health-panel feature component in `src/ui/react/components/features/health-panel.tsx` replacing native issue divs with Card + Badge components
- [X] T046 [US1] Create asset-detail feature component in `src/ui/react/components/features/asset-detail.tsx` replacing native detail aside with Card + Badge + Button + Accordion components for grouped metadata
- [X] T047 [US1] Wire all feature components into `src/ui/react/App.tsx` through the AppShell layout, replacing the current monolithic JSX return
- [X] T048 [US1] Add Toaster (Sonner) to `src/ui/react/App.tsx` replacing the inline feedback section, with aria-live region preserved for accessibility
- [X] T049 [US1] Add hover/focus/active/disabled states to all interactive elements in `src/ui/react/globals.css` and component Tailwind classes, ensuring `--ring` token applies on `focus-visible`
- [X] T050 [US1] Delete `src/ui/react/styles.css` after confirming all styles have migrated to `globals.css` and Tailwind utility classes
- [X] T051 [US1] Run visual comparison: open the app and confirm glass-panel styling, backdrop blur, status colors, and focus rings match the pre-migration baseline

**Checkpoint**: App renders with shadcn/ui components, liquid glass visual identity preserved, all interactive states visible, keyboard navigation functional. This is the MVP hardening slice.

---

## Phase 4: User Story 2 - 改进的导入与队列交互 (Priority: P1)

**Goal**: Import queue shows per-file status with distinct icons and colors, progress indicators, and actionable failure guidance.

**Independent Test**: Import a mixed fixture set; each file status has a unique icon (Lucide) and color; uploading files show a spinning progress indicator; failed items show error reason and suggested action.

### Implementation for User Story 2

- [X] T052 [US2] Update import-queue component in `src/ui/react/components/features/import-queue.tsx` to render Lucide status icons (Clock, Loader2-spin, CheckCircle2, Copy, AlertTriangle, XCircle) with status color tokens for each ImportStatus
- [X] T053 [US2] Add Progress component to uploading items in `src/ui/react/components/features/import-queue.tsx` showing smooth upload progress
- [X] T054 [US2] Add failure detail and next-action guidance to failed queue items in `src/ui/react/components/features/import-queue.tsx` using the `nextAction` field from ImportQueueItem
- [X] T055 [US2] Add import summary counters with distinct status-colored Badge components in `src/ui/react/components/features/import-queue.tsx`
- [X] T056 [US2] Add import button with Lucide Upload icon and hidden file input with `accept` attribute for supported media types in `src/ui/react/components/features/import-queue.tsx`

**Checkpoint**: Import flow has clear visual status differentiation with icons, progress, and actionable failure guidance.

---

## Phase 5: User Story 3 - 改进的筛选与浏览交互 (Priority: P2)

**Goal**: Filters use compact dropdown selects with search, tag autocomplete, calendar date picker, and active filter chips.

**Independent Test**: Open filter dropdowns and verify scrollable options; type in tag filter and see autocomplete; open date picker and select range; verify active filters show as removable chips.

### Implementation for User Story 3

- [X] T057 [US3] Replace native `<select>` elements with shadcn/ui Select component for media type, favorite, thumbnail, metadata, and grouping filters in `src/ui/react/components/features/filter-bar.tsx`
- [X] T058 [US3] Replace tag text input with Popover + Command combo for searchable tag autocomplete in `src/ui/react/components/features/filter-bar.tsx`
- [X] T059 [US3] Replace native date inputs with Popover + Calendar combo for date range selection in `src/ui/react/components/features/filter-bar.tsx`
- [X] T060 [US3] Add active filter chip display using Badge components with individual remove (X) buttons and a "Clear all" Button in `src/ui/react/components/features/filter-bar.tsx`
- [X] T061 [US3] Add empty-state guidance when tag list is empty (Lucide Tag icon + "No tags yet" text) in `src/ui/react/components/features/filter-bar.tsx`

**Checkpoint**: Filter bar is compact, searchable, and shows active conditions as removable chips.

---

## Phase 6: User Story 4 - 改进的批量操作与确认 (Priority: P2)

**Goal**: Batch operations show a floating toolbar, loading states, result feedback via Toast, and AlertDialog for delete confirmation.

**Independent Test**: Select 10+ assets; verify floating toolbar with count; trigger batch tag/favorite and see Toast feedback; trigger batch delete and see AlertDialog with affected count.

### Implementation for User Story 4

- [X] T062 [US4] Update batch-toolbar in `src/ui/react/components/features/batch-toolbar.tsx` to render as a floating bottom bar with selection count Badge, Lucide icons for each action, and disabled state when nothing is selected
- [X] T063 [US4] Add loading state (Loader2 spin icon + disabled buttons) during batch operations in `src/ui/react/components/features/batch-toolbar.tsx`
- [X] T064 [US4] Replace `window.confirm()` with shadcn/ui AlertDialog showing affected asset count and destructive-styled confirm button in `src/ui/react/components/features/batch-toolbar.tsx`
- [X] T065 [US4] Add Toast notifications (success/warning/error) for batch operation results in `src/ui/react/components/features/batch-toolbar.tsx` using the Sonner Toaster
- [X] T066 [US4] Add partial-failure detail display showing success/failure counts as a Toast description in `src/ui/react/components/features/batch-toolbar.tsx`

**Checkpoint**: Batch operations have professional floating toolbar, loading states, Toast feedback, and AlertDialog confirmation.

---

## Phase 7: User Story 5 - 改进的资产详情面板 (Priority: P2)

**Goal**: Detail panel shows grouped metadata, searchable tag editing, animated favorite toggle, and Sheet-based mobile drawer.

**Independent Test**: Click an asset card; verify metadata is grouped by category (file/camera/video) in Accordion sections; type in tag input and see autocomplete; toggle favorite and see animation; on narrow screen, detail opens as right-side Sheet.

### Implementation for User Story 5

- [X] T067 [US5] Update asset-detail in `src/ui/react/components/features/asset-detail.tsx` to render metadata in Accordion sections grouped by category (File Info / Camera Info / Video Info)
- [X] T068 [US5] Replace tag text input with Popover + Command combo for searchable tag autocomplete, allowing selection of existing tags in `src/ui/react/components/features/asset-detail.tsx`
- [X] T069 [US5] Add animated favorite toggle button with Lucide Star/Heart icon and smooth state transition in `src/ui/react/components/features/asset-detail.tsx`
- [X] T070 [US5] Integrate Sheet component for narrow-screen detail view in `src/ui/react/components/layout/detail-panel.tsx`, opening from the right side with close-on-swipe support
- [X] T071 [US5] Add export preflight warning that originals are excluded using Tooltip on the export button in `src/ui/react/components/layout/app-shell.tsx`

**Checkpoint**: Detail panel has grouped metadata, searchable tags, animated favorite, and mobile Sheet drawer.

---

## Phase 8: User Story 6 - 响应式布局与健康面板优化 (Priority: P3)

**Goal**: Responsive layout switches smoothly between three breakpoints, and health issues display as compact cards with severity indicators.

**Independent Test**: Resize browser across three breakpoints (1050px, 680px); verify layout transitions; in a library with health issues, verify issues render as compact severity-labeled cards.

### Implementation for User Story 6

- [X] T072 [US6] Update AppShell in `src/ui/react/components/layout/app-shell.tsx` with Tailwind responsive classes for three-column (lg), single-column with Sheet sidebar (md), and compact single-column (sm) layouts
- [X] T073 [US6] Add Sheet-based sidebar for medium and small screens with filter icon trigger button in `src/ui/react/components/layout/sidebar.tsx`
- [X] T074 [US6] Update health-panel in `src/ui/react/components/features/health-panel.tsx` to render each issue as a compact Card with severity Badge, affected count, and recommended action
- [X] T075 [US6] Add health summary Progress bar showing the ratio of healthy vs. affected assets in `src/ui/react/components/features/health-panel.tsx`

**Checkpoint**: Responsive layout works across all breakpoints; health panel shows compact severity cards with progress indicator.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, test updates, documentation, and full validation.

- [X] T076 [P] Delete legacy frontend files `src/ui/app.js`, `src/ui/app.ts`, `src/ui/styles.css`
- [X] T077 [P] Delete legacy UI contract test `tests/contract/ui-static.test.ts`
- [X] T078 [P] Remove `<template id="legacy-static-contract">` block from `src/ui/index.html`
- [X] T079 [P] Update `tests/unit/react-import-state.test.ts` to import from new component paths (`@/components/features/import-queue`, `@/hooks/use-import`)
- [X] T080 [P] Update `tests/unit/react-selection-state.test.ts` to import from new component paths (`@/components/features/batch-toolbar`, `@/hooks/use-selection`)
- [X] T081 [P] Update `tests/unit/react-grouping-state.test.ts` to import from new component paths
- [X] T082 [P] Update `tests/unit/react-health-export-state.test.ts` to import from new component paths
- [X] T083 Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` from repository root
- [X] T084 Execute `specs/005-ui-framework-adoption/quickstart.md` validation steps 1-7 end to end and update any stale instructions
- [X] T085 Verify no `window.confirm` or `window.alert` calls remain in `src/ui/react/` source files
- [X] T086 Measure built bundle size and confirm growth is within 50% of baseline per SC-005

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Story 1 (Phase 3, P1)**: Depends on Foundational; first MVP slice — framework replacement with visual consistency.
- **User Story 2 (Phase 4, P1)**: Depends on Foundational + US1 import-queue component existing.
- **User Story 3 (Phase 5, P2)**: Depends on Foundational + US1 filter-bar component existing.
- **User Story 4 (Phase 6, P2)**: Depends on Foundational + US1 batch-toolbar component existing.
- **User Story 5 (Phase 7, P2)**: Depends on Foundational + US1 asset-detail component existing.
- **User Story 6 (Phase 8, P3)**: Depends on Foundational + US1 layout and health components existing.
- **Polish (Phase 9)**: Depends on all selected user stories.

### User Story Dependencies

- **US1 Framework Replacement**: No dependency on later stories; MVP hardening slice.
- **US2 Import Interaction**: Enhances US1's import-queue component; independent testable.
- **US3 Filter Interaction**: Enhances US1's filter-bar component; independent testable.
- **US4 Batch Operations**: Enhances US1's batch-toolbar component; independent testable.
- **US5 Detail Panel**: Enhances US1's asset-detail component; independent testable.
- **US6 Responsive & Health**: Enhances US1's layout and health components; independent testable.

### Within Each User Story

- Update shared types before component code that consumes them.
- Implement Hook logic before component rendering.
- Implement component behavior before styling refinement.
- Validate the story independently before proceeding.

## Parallel Opportunities

- T002, T005 can run in parallel after T001 installs Tailwind.
- T010–T027 (all shadcn/ui component additions) can run in parallel — they are independent files.
- T028–T032 (all custom Hooks) can run in parallel — they extract from different state slices.
- T033–T036 (layout components) can mostly run in parallel after T033 defines the grid shell.
- T076–T082 (Polish cleanup tasks) can run in parallel.
- US2, US3, US4, US5, US6 can be parallelized after US1 if workers coordinate edits to shared component files.

## Parallel Example: User Story 1

```text
Task: T041 [US1] Create filter-bar in src/ui/react/components/features/filter-bar.tsx
Task: T042 [US1] Create import-queue in src/ui/react/components/features/import-queue.tsx
Task: T043 [US1] Create asset-grid in src/ui/react/components/features/asset-grid.tsx
Task: T044 [US1] Create batch-toolbar in src/ui/react/components/features/batch-toolbar.tsx
Task: T045 [US1] Create health-panel in src/ui/react/components/features/health-panel.tsx
Task: T046 [US1] Create asset-detail in src/ui/react/components/features/asset-detail.tsx
```

## Parallel Example: Foundational Phase

```text
Task: T010–T027 [P] Add all 18 shadcn/ui components (independent files)
Task: T028–T032 [P] Extract all 5 custom Hooks (independent state slices)
Task: T033–T036 [P] Create all 4 layout components (after T033 defines grid)
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 / US1.
3. Stop and validate: open the app and confirm liquid glass styling, all interactive states, and keyboard navigation work.
4. Only after US1 passes visual validation, proceed to US2.

### Incremental Delivery

1. Tailwind + shadcn/ui foundation and contracts.
2. Framework replacement with visual consistency (US1).
3. Import interaction improvements (US2).
4. Filter interaction improvements (US3).
5. Batch operation improvements (US4).
6. Detail panel improvements (US5).
7. Responsive layout + health optimization (US6).
8. Cleanup, test updates, and validation (Polish).

### Scope Guardrail

This task list must not introduce public sharing, multi-user collaboration, hosted accounts, professional review workflows, or backup/restore behavior. The product remains a personal photography/media asset management tool for a trusted private environment.
