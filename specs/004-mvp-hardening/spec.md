# Feature Specification: MVP Hardening

**Feature Branch**: `004-mvp-hardening`  
**Created**: 2026-05-06  
**Status**: Completed  
**Input**: User description: "为个人摄影/媒体资产管理 MVP 制定可靠硬化计划：优先保证真实媒体导入稳定性，覆盖浏览器端真实上传回归，补齐批量管理、时间线分组浏览、健康检查可操作化和数据可信度提示，尽快把当前 70% MVP 提升到可交给早期用户长期自用的版本。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reliable Real Media Import (Priority: P1)

As a photography/media asset management enthusiast, I want to drag a realistic mixed set of personal photos and videos into the library and receive a clear result for every file, so I can trust the product with my real collection instead of only curated test files.

**Why this priority**: Import reliability is the foundation of the MVP. If common files fail with generic server errors or unclear outcomes, the rest of the asset management experience is not trustworthy.

**Independent Test**: Can be fully tested by importing a mixed media sample set through the browser and confirming every item reaches a visible accepted, duplicate, unsupported, or failed outcome while the library remains usable.

**Acceptance Scenarios**:

1. **Given** an empty or existing personal library, **When** the user imports a mixed set containing JPEG, PNG, HEIC, MOV, MP4, duplicate files, an unsupported file, a damaged file, and at least one large file, **Then** every file receives a clear per-file result and no generic crash or unhandled failure is shown.
2. **Given** at least one file in the import set cannot be accepted, **When** the import finishes, **Then** successful files remain in the library and failed or unsupported files remain visible with practical next-step guidance.
3. **Given** a file has already been imported, **When** the user imports it again, **Then** the product identifies it as a duplicate and links the result to the existing managed asset when possible.

---

### User Story 2 - Browser-Based Regression Confidence (Priority: P1)

As the product owner, I want a repeatable real-browser acceptance workflow for core MVP actions, so we can detect user-visible regressions before claiming the MVP is stable.

**Why this priority**: Previous command-line tests did not catch a real PNG upload failure. The MVP needs verification that exercises the same path a user takes in the browser.

**Independent Test**: Can be tested by running the acceptance workflow against a fresh library and confirming import, browsing, filtering, detail inspection, mutation, deletion confirmation, health status, and summary export complete without user-visible failure.

**Acceptance Scenarios**:

1. **Given** a fresh local library, **When** the browser acceptance workflow imports the sample media set, filters results, opens details, changes tags/favorites, confirms a delete, checks health, and exports a summary, **Then** the workflow completes and records clear pass/fail evidence for each step.
2. **Given** an acceptance step fails, **When** the result is reviewed, **Then** the failure identifies the user action, expected outcome, actual outcome, and visible error message or missing UI state.

---

### User Story 3 - Batch Organization for Personal Collections (Priority: P2)

As a personal media library user, I want to select multiple assets and organize them together, so common cleanup tasks do not require repetitive one-by-one edits.

**Why this priority**: Batch tagging, favoriting, and deletion are basic productivity features for a media collection and directly improve daily usability after import reliability is proven.

**Independent Test**: Can be tested by selecting several imported assets, applying a tag, toggling favorite state, and deleting a selected subset with confirmation while the remaining library state stays clear.

**Acceptance Scenarios**:

1. **Given** a populated library, **When** the user selects multiple assets and applies one or more tags, **Then** each selected asset shows the new organization state and the selection result is summarized.
2. **Given** multiple assets are selected, **When** the user starts a destructive batch action, **Then** the product clearly names the number of affected assets and requires confirmation before applying the action.
3. **Given** a batch action partially fails, **When** the action completes, **Then** successful and failed asset outcomes are both visible and the user can continue managing the library.

---

### User Story 4 - Timeline And Grouped Browsing (Priority: P2)

As a photography enthusiast, I want to browse assets by date periods and meaningful groups such as camera or tag, so the library feels organized around how I remember shoots.

**Why this priority**: A flat grid is adequate for the first MVP slice, but personal photo management becomes useful when users can scan by time and collection context.

**Independent Test**: Can be tested by importing assets from multiple dates and cameras, switching grouping modes, and confirming assets appear under accurate, readable groups with existing filters preserved.

**Acceptance Scenarios**:

1. **Given** assets with different capture dates or fallback file dates, **When** the user browses by timeline grouping, **Then** assets appear under clear date groups and can still be opened from those groups.
2. **Given** assets with tags or camera metadata, **When** the user chooses tag or camera grouping, **Then** grouped sections show relevant assets without losing current filters or pagination context.

---

### User Story 5 - Actionable Data Confidence (Priority: P3)

As a cautious personal library user, I want the product to explain what is safely managed, what is missing, and what exports do or do not contain, so I do not mistake a catalog for a full media backup.

**Why this priority**: The MVP must earn trust without overpromising. Health checks and export boundaries should help users make safe decisions with their originals and metadata.

**Independent Test**: Can be tested by creating assets with missing originals, thumbnails, or metadata and confirming the product shows severity, affected assets, and practical action guidance.

**Acceptance Scenarios**:

1. **Given** the library contains assets with missing originals, missing thumbnails, missing metadata, or duplicate identity, **When** the user opens health status, **Then** the product groups issues by severity and shows affected asset context.
2. **Given** the user starts a summary export, **When** the export is prepared, **Then** the product clearly states that original media files are not included and the user can verify what the export represents.

### Edge Cases

- Imports include files with the right extension but unreadable or damaged content.
- Imports include zero-byte files, very large files, duplicate filenames, and duplicate content under different names.
- Imports include media missing capture date, camera metadata, thumbnail support, or original file access.
- The user navigates away from an import result and returns to the library during the same session.
- Batch operations include assets that have already been deleted or cannot be updated.
- Grouped browsing must handle assets with unknown date, unknown camera, or no tags.
- Health status must not imply that the summary export is a backup of original media.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST accept realistic personal media imports through the browser for common photo and video formats including JPEG, PNG, HEIC, MOV, and MP4 when the file can be read and stored.
- **FR-002**: The product MUST return a clear per-file outcome for every imported file: accepted, duplicate, unsupported, failed, or still in progress.
- **FR-003**: The product MUST prevent generic unhandled failures from being the final user-visible result of an import; failures must be captured and explained at the file or batch level.
- **FR-004**: The product MUST keep successfully imported files usable even when other files in the same batch fail or are unsupported.
- **FR-005**: The product MUST identify duplicate media content when the same file is imported again and communicate whether the existing asset was reused.
- **FR-006**: The product MUST provide a repeatable real-browser acceptance workflow that covers import, browsing, filtering, asset detail, favorite/tag changes, delete confirmation, health review, and summary export.
- **FR-007**: The browser acceptance workflow MUST produce actionable failure evidence that includes the user-visible step, expected result, actual result, and any visible error text.
- **FR-008**: Users MUST be able to select multiple assets and apply tags to all selected assets in one action.
- **FR-009**: Users MUST be able to select multiple assets and change favorite state for all selected assets in one action.
- **FR-010**: Users MUST be able to delete multiple selected assets only after a confirmation that clearly states the number of affected assets.
- **FR-011**: The product MUST show partial success and failure outcomes for batch actions without hiding the remaining library state.
- **FR-012**: Users MUST be able to browse assets grouped by date period using capture date when available and a clear fallback date when capture date is unavailable.
- **FR-013**: Users MUST be able to browse assets grouped by tag and camera when those attributes are available.
- **FR-014**: Grouped browsing MUST preserve active filters and allow users to open asset details from grouped sections.
- **FR-015**: The product MUST show actionable health information for missing originals, missing thumbnails, missing metadata, duplicate identity, and other library confidence issues.
- **FR-016**: Health information MUST include severity, affected asset context, and recommended user action where a practical action exists.
- **FR-017**: Summary export entry points MUST clearly state that exports contain catalog/metadata summaries and do not include original media files.
- **FR-018**: The feature MUST remain scoped to a private personal product and MUST NOT add public sharing, multi-user accounts, hosted collaboration, professional review workflows, or full backup/restore claims.

### Key Entities *(include if feature involves data)*

- **Media Import Sample Set**: A curated collection of representative personal media and edge-case files used to validate import reliability.
- **Import Outcome**: The per-file result shown to the user after import, including status, reason, related asset when available, and next-step guidance.
- **Browser Acceptance Run**: A repeatable user-facing validation record covering the core MVP workflow and any failure evidence.
- **Asset Selection**: The user's current multi-asset selection for batch organization or destructive actions.
- **Batch Action Result**: The summary of selected-asset changes, including success count, failure count, and affected assets.
- **Browse Group**: A visible grouping of assets by date period, camera, or tag.
- **Health Issue**: A library confidence finding with severity, affected asset context, and recommended user action.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A mixed sample set of at least 20 files, including JPEG, PNG, HEIC, MOV, MP4, duplicate, unsupported, damaged, and large-file cases, completes import with 100% of files receiving a visible final outcome.
- **SC-002**: Importing the supported valid files in the sample set produces no generic crash, unhandled failure screen, or unresolved in-progress item across 5 consecutive fresh-library runs.
- **SC-003**: The browser acceptance workflow completes the core MVP path in under 5 minutes on a typical local development machine and records pass/fail evidence for every step.
- **SC-004**: A user can batch tag, favorite, and delete selected assets in under 2 minutes for a set of at least 10 assets.
- **SC-005**: Users can switch between flat browsing, timeline grouping, tag grouping, and camera grouping without losing active filters or selected asset detail in at least 95% of tested transitions.
- **SC-006**: Health status identifies missing-original, missing-thumbnail, and missing-metadata cases with severity and affected asset context for 100% of seeded confidence issues.
- **SC-007**: Export messaging is clear enough that a first-time tester can correctly state that original media files are not included in the summary export after one export attempt.

## Assumptions

- The target user remains a single personal user managing their own local/private photo and media collection.
- The MVP hardening target is early-user self-use reliability, not enterprise DAM completeness or cloud sync.
- The representative media sample set can use small fixture media plus generated edge-case files where licensing or file size makes real samples impractical.
- Browser acceptance means exercising the visible product workflow, not only lower-level service behavior.
- Batch operations should favor clear user feedback and recoverability over advanced automation.
- Grouped browsing should improve organization without replacing the existing filterable grid.
- Summary export remains a catalog/metadata export and is intentionally not a replacement for a backup of originals.
