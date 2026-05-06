# Implementation Plan: MVP Hardening

**Branch**: `004-mvp-hardening` | **Date**: 2026-05-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-mvp-hardening/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Harden Lenbrary's current personal media library MVP so it can be trusted by early self-use users. The plan prioritizes real browser import reliability and repeatable browser acceptance evidence, then adds batch organization, grouped browsing, and actionable data-confidence messaging. The implementation should keep the existing local/private single-process architecture, reuse the current upload, library, storage, metadata, and static UI surfaces, and avoid scope expansion into sharing, accounts, SaaS, professional DAM workflows, or backup/restore guarantees.

The technical approach is to make `/api/library/import` perform real per-file asset processing instead of reporting only pending outcomes, add small library support contracts for batch mutations and grouped listing, extend health issue detail, and add browser-level acceptance coverage that exercises the visible UI path with realistic fixtures. The existing static UI is replaced by a React UI built with Vite and served by the same Express application.

## Technical Context

**Language/Version**: Node.js >=22.18.0, TypeScript 5, React 19 built with Vite and served by the existing app  
**Primary Dependencies**: Express 4, multer, file-type, sharp, exiftool-vendored, fluent-ffmpeg, better-sqlite3, React, React DOM, Vite, Vitest, oxlint, TypeScript compiler, Playwright for browser acceptance evidence  
**Storage**: Existing local filesystem originals/thumbnails/temp directories and SQLite database for assets, metadata, favorites/tags, file hashes, and import events; no hosted storage or backup store  
**Testing**: Existing `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; add realistic media fixture coverage, service/integration tests for import outcomes and batch/group/health contracts, and browser acceptance workflow for the visible MVP loop  
**Target Platform**: Local/private self-hosted personal web application in desktop and mobile-width browsers  
**Project Type**: Existing web service with React browser UI served by the same process  
**Performance Goals**: 20-file mixed browser import receives final visible outcomes; 5 consecutive fresh-library import runs produce no generic crash; browser MVP acceptance finishes in under 5 minutes locally; batch actions over 10 selected assets complete in under 2 minutes; grouped browsing transitions preserve filters/detail in tested flows  
**Constraints**: Single-user private product; preserve liquid glass operational UI; keep React in the same repository/application boundary; summary export remains catalog/metadata only; no public sharing, multi-user accounts, hosted collaboration, professional DAM review workflows, or backup/restore claims  
**Scale/Scope**: MVP hardening for one personal user and realistic small-to-medium import batches, not high-volume enterprise ingestion

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is still the default placeholder template and defines no concrete enforceable principles. This plan applies the current product-specific gates:

- **Personal-product scope**: PASS. Work remains single-user, local/private, and personal-media focused.
- **Reliability before expansion**: PASS. P1 is import reliability and browser acceptance evidence before batch/group polish.
- **No architecture jump**: PASS. The plan stays within the existing Express, SQLite, filesystem, and static UI shape.
- **Data confidence boundary**: PASS. Export and health messaging must not imply original-media backup.
- **Real user-path verification**: PASS. Browser acceptance is explicitly required because previous lower-level tests missed a visible upload failure.
- **Liquid glass usability**: PASS. UI changes must preserve the current liquid glass direction while keeping readable, non-overlapping operational controls.

## Project Structure

### Documentation (this feature)

```text
specs/004-mvp-hardening/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contract.md
│   ├── browser-acceptance-contract.md
│   └── ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── routes/
│   └── library.routes.ts
├── services/
│   ├── database.service.ts
│   ├── image.service.ts
│   ├── library.service.ts
│   ├── storage.service.ts
│   └── video.service.ts
├── types/
│   └── library.types.ts
└── ui/
    ├── index.html
    └── react/
        ├── main.tsx
        ├── App.tsx
        ├── api.ts
        ├── types.ts
        └── styles.css

tests/
├── fixtures/
│   └── media/
├── acceptance/
├── contract/
├── integration/
├── unit/
└── helpers/
```

**Structure Decision**: Keep this as a hardening increment inside the existing application. Primary server changes belong in `src/routes/library.routes.ts`, `src/services/library.service.ts`, related media/storage/database helpers where needed, and `src/types/library.types.ts`. Primary UI changes live in `src/ui/react/`, with Vite building assets into `dist/ui` for Express to serve. Add fixture and acceptance test folders for browser-path coverage.

## Complexity Tracking

No constitution violations or justified complexity exceptions. Any new browser automation dependency must be dev-only and limited to user-visible acceptance coverage.

## Phase 0: Research

Research is complete in [research.md](./research.md). It resolves the main design decisions for real import processing, fixture strategy, browser acceptance, batch operations, grouped browsing, health details, and export boundary messaging.

## Phase 1: Design & Contracts

Design artifacts are complete:

- [data-model.md](./data-model.md): Defines Media Import Sample Set, Import Outcome, Browser Acceptance Run, Asset Selection, Batch Action Result, Browse Group, and Health Issue.
- [contracts/api-contract.md](./contracts/api-contract.md): Defines import, batch mutation, grouped browsing, health, and export support contracts.
- [contracts/browser-acceptance-contract.md](./contracts/browser-acceptance-contract.md): Defines the repeatable visible MVP acceptance workflow and failure evidence contract.
- [contracts/ui-contract.md](./contracts/ui-contract.md): Defines page behavior for import outcomes, selection, batch actions, grouping, health guidance, export messaging, and liquid glass usability.
- [quickstart.md](./quickstart.md): Defines validation workflow for tests and manual/browser MVP hardening checks.

## Post-Design Constitution Check

The feature-specific gates remain satisfied:

- **Personal-product scope**: PASS. Contracts avoid accounts, sharing, hosted operation, professional workflows, and backup/restore guarantees.
- **Reliability before expansion**: PASS. API and browser contracts make real import processing and acceptance evidence the first deliverable.
- **No architecture jump**: PASS. Design uses existing routes, services, local persistence, and a same-app React UI without adding hosted or multi-service architecture.
- **Data confidence boundary**: PASS. Health/export contracts distinguish catalog state from original-media backup.
- **Real user-path verification**: PASS. Browser acceptance contract explicitly tests visible upload and MVP workflow.
- **Liquid glass usability**: PASS. UI contract requires current visual style to stay readable and operational.
