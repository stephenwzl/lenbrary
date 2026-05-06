# Tasks: 筛选器维度优化

**Input**: Design documents from `/specs/006-filter-dimensions/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/filter-api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 数据库迁移和共享类型扩展，为所有用户故事提供基础

- [ ] T001 Create database migration V00000010__add_filter_dimension_indexes.sql in src/migrations/ — add indexes for f_number, focal_length, exposure_time, iso on asset_exif; create asset_locations table with indexes on city, country, (city, country)
- [ ] T002 Extend LibraryFilters interface with 18 new optional fields in src/types/library.types.ts — captureDateFrom/To, lens, fNumberMin/Max, focalLengthMin/Max, exposureTimeMin/Max, isoMin/Max, location, isHdr, videoCodec, durationMin/Max, frameRateMin/Max
- [ ] T003 [P] Extend FilterState interface with 18 new fields in src/ui/react/types.ts — same dimensions as LibraryFilters but all string-typed, matching existing pattern
- [ ] T004 [P] Add FacetsResponse, CameraOption, LocationOption types to src/types/library.types.ts

---

## Phase 2: Foundational (Backend Core)

**Purpose**: 后端核心逻辑扩展——参数解析、SQL 查询构建、facets 端点。所有用户故事依赖此阶段完成。

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Extend parseFilters in src/services/library.service.ts — parse captureDateFrom/To, lens, fNumberMin/Max, focalLengthMin/Max, exposureTimeMin/Max, isoMin/Max, location, isHdr, videoCodec, durationMin/Max, frameRateMin/Max; change camera from LIKE to exact match with LIKE fallback
- [ ] T006 Refactor getLibraryAssets in src/services/database.service.ts — implement on-demand JOIN strategy (only JOIN tables when their filters are active); add WHERE clauses for all 18 new filter dimensions; use conditional DISTINCT only when one-to-many tables are JOINed
- [ ] T007 Implement getFacets method in src/services/database.service.ts — query distinct cameras (make+model), lenses (lens_model), videoCodecs (video_codec), locations (city+country) from asset_exif, asset_video_metadata, asset_locations
- [ ] T008 Add GET /api/library/facets route in src/routes/library.routes.ts — call libraryService.getFacets(), return FacetsResponse
- [ ] T009 Add reverse geocoding integration in src/services/metadata.service.ts (or equivalent) — when EXIF contains gps_latitude/gps_longitude, call offline reverse geocoder and write result to asset_locations table; trigger on asset import/metadata extraction

**Checkpoint**: Backend fully supports all new filter dimensions — user story implementation can now begin

---

## Phase 3: User Story 1 - 按拍摄日期筛选照片 (Priority: P1) 🎯 MVP

**Goal**: 用户可按拍摄日期（EXIF date_time_original）筛选资产，与导入日期独立，两个日期维度可同时使用

**Independent Test**: Set captureDateFrom/To and verify all returned assets have date_time_original within range; verify dateFrom/dateTo still filters by created_at

### Implementation for User Story 1

- [ ] T010 [US1] Add captureDateFrom/To WHERE clauses to SQL in src/services/database.service.ts — use REPLACE(date_time_original, ':', '-') for ISO format comparison or convert to Unix timestamp; leverage existing idx_exif_date_time_original index
- [ ] T011 [US1] Add captureDateFrom/To date pickers to FilterBar in src/ui/react/components/features/filter-bar.tsx — new "拍摄日期" section with two Popover+Calendar date pickers, visually separated from existing "导入日期" section; rename existing dateFrom/dateTo labels to "导入日期"
- [ ] T012 [US1] Update emptyFilters in src/ui/react/hooks/use-filters.ts — add captureDateFrom: '', captureDateTo: ''
- [ ] T013 [US1] Add captureDateFrom/To active filter chips with remove buttons in src/ui/react/components/features/filter-bar.tsx

**Checkpoint**: User Story 1 complete — capture date filtering works independently, import date filtering preserved unchanged

---

## Phase 4: User Story 2 - 按镜头和拍摄参数筛选 (Priority: P1)

**Goal**: 用户可按镜头型号、光圈范围、焦距范围、快门速度范围、ISO 范围筛选照片

**Independent Test**: Select a specific lens or set f_number/focal_length/exposure_time/iso ranges and verify returned assets match EXIF data

### Implementation for User Story 2

- [ ] T014 [US2] Add lens/exposure/fNumber/focalLength/iso WHERE clauses to SQL in src/services/database.service.ts — lens: exact match on lens_model; f_number: BETWEEN or >= / <= ; focal_length: BETWEEN or >= / <= ; exposure_time: BETWEEN or >= / <= ; iso: BETWEEN or >= / <=
- [ ] T015 [US2] Add lens autocomplete Select to FilterBar in src/ui/react/components/features/filter-bar.tsx — use facets.lenses data with shadcn/ui Select; add "拍摄参数" section
- [ ] T016 [US2] Add f_number range inputs to FilterBar in src/ui/react/components/features/filter-bar.tsx — two Input fields (min/max) with "f/" prefix display
- [ ] T017 [US2] Add focal_length range inputs to FilterBar in src/ui/react/components/features/filter-bar.tsx — two Input fields (min/max) with "mm" suffix display
- [ ] T018 [US2] Add exposure_time range inputs to FilterBar in src/ui/react/components/features/filter-bar.tsx — two Input fields with shutter speed fraction display (e.g., "1/30"); add fraction-to-decimal conversion helper
- [ ] T019 [US2] Add ISO range inputs to FilterBar in src/ui/react/components/features/filter-bar.tsx — two Input fields (min/max)
- [ ] T020 [US2] Update emptyFilters in src/ui/react/hooks/use-filters.ts — add lens: '', fNumberMin: '', fNumberMax: '', focalLengthMin: '', focalLengthMax: '', exposureTimeMin: '', exposureTimeMax: '', isoMin: '', isoMax: ''
- [ ] T021 [US2] Add active filter chips for lens and exposure parameter ranges in src/ui/react/components/features/filter-bar.tsx — display human-readable labels (e.g., "f/1.2 - f/2.8", "1/30s - 1s", "ISO 100 - 800")

**Checkpoint**: User Story 2 complete — lens and all exposure parameter filters work independently and together

---

## Phase 5: User Story 3 - 按地理位置筛选 (Priority: P2)

**Goal**: 用户可通过输入城市或地点名称筛选含 GPS 信息的照片

**Independent Test**: Enter a city name and verify returned assets have GPS coordinates matching that location; verify empty-state prompt when no GPS assets exist

### Implementation for User Story 3

- [ ] T022 [US3] Add location WHERE clause to SQL in src/services/database.service.ts — LEFT JOIN asset_locations when location filter active; LIKE match on city and country columns
- [ ] T023 [US3] Add location autocomplete input to FilterBar in src/ui/react/components/features/filter-bar.tsx — use facets.locations data with Popover+Command; add "地理位置" section; show empty-state "暂无含位置信息的资产" when locations list is empty
- [ ] T024 [US3] Update emptyFilters in src/ui/react/hooks/use-filters.ts — add location: ''
- [ ] T025 [US3] Add "仅展示含位置信息的资产" notice when location filter is active in src/ui/react/components/features/filter-bar.tsx

**Checkpoint**: User Story 3 complete — location filtering works, empty states handled

---

## Phase 6: User Story 4 - 按视频属性筛选 (Priority: P2)

**Goal**: 用户可按 HDR 状态、视频编码、时长范围、帧率范围筛选视频

**Independent Test**: Check HDR filter or select video codec and verify returned videos match; verify video filters hidden when type=image

### Implementation for User Story 4

- [ ] T026 [US4] Add isHdr/videoCodec/duration/frameRate WHERE clauses to SQL in src/services/database.service.ts — is_hdr: = 1 or = 0; video_codec: exact match; duration: >= / <= ; frame_rate: >= / <=
- [ ] T027 [US4] Add HDR Select to FilterBar in src/ui/react/components/features/filter-bar.tsx — three-state Select (Any / HDR / SDR) in "视频属性" section
- [ ] T028 [US4] Add videoCodec autocomplete Select to FilterBar in src/ui/react/components/features/filter-bar.tsx — use facets.videoCodecs data
- [ ] T029 [US4] Add duration range inputs to FilterBar in src/ui/react/components/features/filter-bar.tsx — two Input fields (min/max) with "s" suffix
- [ ] T030 [US4] Add frameRate range inputs to FilterBar in src/ui/react/components/features/filter-bar.tsx — two Input fields (min/max) with "fps" suffix
- [ ] T031 [US4] Add conditional rendering for video filters in src/ui/react/components/features/filter-bar.tsx — hide "视频属性" section when filters.type === 'image'; show when type is '' or 'video'
- [ ] T032 [US4] Update emptyFilters in src/ui/react/hooks/use-filters.ts — add isHdr: '', videoCodec: '', durationMin: '', durationMax: '', frameRateMin: '', frameRateMax: ''

**Checkpoint**: User Story 4 complete — video attribute filters work and hide appropriately for image-only view

---

## Phase 7: User Story 5 - 筛选器交互优化 (Priority: P3)

**Goal**: 相机筛选器升级为自动补全；数值范围筛选器显示友好标签；筛选状态清晰可见

**Independent Test**: Click camera filter and verify autocomplete list; verify filter count display; verify range chip readability

### Implementation for User Story 5

- [ ] T033 [US5] Upgrade camera filter from text Input to autocomplete Select in src/ui/react/components/features/filter-bar.tsx — use facets.cameras data with shadcn/ui Select; display CameraOption.label; send "make model" as filter value
- [ ] T034 [US5] Add fetchFacets() to src/ui/react/api.ts — call GET /api/library/facets, return FacetsResponse
- [ ] T035 [US5] Add facets state management to src/ui/react/hooks/use-filters.ts — load facets on mount via fetchFacets(); expose facets in hook return value; refresh after asset changes
- [ ] T036 [US5] Enhance activeFilterCount display in src/ui/react/components/features/filter-bar.tsx — ensure all new filter dimensions are counted; display "N 个筛选条件已激活" with clear button
- [ ] T037 [US5] Add human-readable formatting for range filter chips in src/ui/react/components/features/filter-bar.tsx — f_number: "f/x.x", focal_length: "xxmm", exposure_time: fraction format "1/30s", iso: "ISO xxx", duration: "Xs - Xm", frame_rate: "X - Y fps"
- [ ] T038 [US5] Add missing-metadata notice when EXIF-filtered results exclude assets in src/ui/react/components/features/filter-bar.tsx — show "部分资产因缺少元数据信息未被展示" when EXIF-based filters are active

**Checkpoint**: User Story 5 complete — all interaction improvements in place

---

## Phase 8: Polish & Validation

**Purpose**: 测试、验证和收尾

- [ ] T039 Update unit test for createLibraryQuery in tests/unit/ui-state.test.ts — verify new filter dimensions (captureDateFrom, lens, fNumberMin, etc.) are correctly serialized to query string
- [ ] T040 Update integration test for filter dimensions in tests/integration/frontend-control-surface.test.ts — verify /api/library/assets accepts new query params and returns correct results
- [ ] T041 Add contract test for facets API in tests/contract/filter-api.test.ts — verify GET /api/library/facets returns correct FacetsResponse structure with cameras, lenses, videoCodecs, locations arrays
- [ ] T042 Run full lint/typecheck/test/build validation
- [ ] T043 Verify zero regression — existing filters (type, favorite, tag, camera, dateFrom/dateTo, hasThumbnail, hasMetadata, groupBy) all work unchanged
- [ ] T044 Verify video filters hidden when type=image in FilterBar
- [ ] T045 Update CLAUDE.md spec reference (verify already points to specs/006-filter-dimensions/plan.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Phase 2 completion
  - US1 and US2 can proceed in parallel (different SQL columns, different UI sections)
  - US3 depends on asset_locations table (created in T001) and reverse geocoding (T009)
  - US4 depends on video metadata columns (already in DB)
  - US5 depends on facets API (T008) and all previous stories for complete UI
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 — no dependency on other stories
- **US2 (P1)**: Depends on Phase 2 — no dependency on other stories
- **US3 (P2)**: Depends on Phase 2 + T009 (reverse geocoding)
- **US4 (P2)**: Depends on Phase 2 — no dependency on other stories
- **US5 (P3)**: Depends on facets API (T008) + all previous stories for complete UI

### Parallel Opportunities

- T001 + T002 + T003 + T004 can all run in parallel (different files)
- T005 + T006 can run in parallel with T007 + T008 (different methods in different files — but T006 is a refactor that touches the same method, so T005 must complete first)
- Within US2: T015-T019 can run in parallel (different UI sections in same file, but sequential is safer for same-file edits)
- US1 + US4 can be implemented in parallel (different filter dimensions, different SQL columns)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009)
3. Complete Phase 3: User Story 1 (T010-T013)
4. **STOP and VALIDATE**: Test capture date filtering independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Backend ready
2. Add US1 → Capture date filtering → Deploy/Demo (MVP!)
3. Add US2 → Lens + exposure params → Deploy/Demo
4. Add US3 → Location filtering → Deploy/Demo
5. Add US4 → Video attribute filtering → Deploy/Demo
6. Add US5 → Interaction polish → Deploy/Demo
7. Polish + validation → Complete feature

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- date_time_original is TEXT type in SQLite ("2025:07:15 14:30:00") — SQL comparison needs format handling
- camera filter changes from LIKE to exact match — backward compatibility maintained via fallback in parseFilters
- asset_locations requires reverse geocoding (T009) — if offline geocoder package is too large, can defer to a post-MVP phase
- All FilterState fields are string-typed to match existing pattern — type conversion happens in parseFilters
- on-demand JOIN strategy (T006) is critical for performance with 5+ table joins
