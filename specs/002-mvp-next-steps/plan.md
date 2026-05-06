# Implementation Plan: MVP Next Steps

**Branch**: `002-mvp-next-steps` | **Date**: 2026-05-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-mvp-next-steps/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build the shortest usable MVP for Lenbrary as a personal photography/media asset management product: a single-user review loop where an enthusiast imports mixed images/videos, visually browses assets, filters by media and metadata, opens asset details, deletes unwanted assets, adds lightweight organization markers, checks library health, and exports a readable asset catalog/metadata index that excludes original media files.

The implementation approach is incremental on the existing Node.js/TypeScript service. Keep the current media ingestion, deduplication, thumbnail, metadata, listing, detail, file, thumbnail, EXIF, video metadata, and delete foundation. Add the missing product surfaces: richer library query/status/export endpoints, persistence for favorites and tags, import outcome behavior suitable for UI use, and a lightweight browser UI served by the application for the MVP review loop.

## Technical Context

**Language/Version**: Node.js >=22.18.0, TypeScript 5, ES modules  
**Primary Dependencies**: Existing Express 4 service, better-sqlite3, multer, file-type, sharp, exiftool-vendored, fluent-ffmpeg, swagger tooling, Vitest, oxlint, TypeScript compiler  
**Storage**: Existing local filesystem originals/thumbnails/temp directories plus SQLite database; new metadata state should be stored in SQLite migrations  
**Testing**: Existing `npm run lint`, `npm run typecheck`, `npm test`; add focused Vitest coverage for new database/service behavior and contract-style request tests where practical  
**Target Platform**: Local/private self-hosted personal web application and web service running on the existing server process  
**Project Type**: Existing web service extended with a lightweight web UI and additional service endpoints  
**Performance Goals**: First-time user can import 20 mixed assets, browse, inspect, and delete within 10 minutes; 200-asset library filtering interaction completes within 5 seconds; exported summary is readable outside the app  
**Constraints**: Single-user personal/private scope; no multi-user accounts, public sharing, hosted SaaS, role system, rights management, or full backup/restore in MVP; summary export excludes original media files; preserve original media files as durable user value; derived previews/metadata remain best-effort but visible  
**Scale/Scope**: MVP for one personal library with hundreds of assets as the validation scale; batch import should report per-file outcomes; organization scope limited to favorites and free-form tags

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is still the default placeholder template and defines no concrete project principles, gates, or governance rules. This plan therefore applies feature-specific gates derived from the current product documentation and MVP spec:

- **Personal-product scope**: PASS. The plan remains single-user and private/local; public sharing, collaboration, hosted accounts, and professional DAM workflows remain out of scope.
- **Fastest MVP path**: PASS. The plan reuses existing ingestion, storage, duplicate detection, thumbnail, metadata, listing, retrieval, and deletion behavior before adding new product surfaces.
- **User-facing review loop**: PASS. P1 is planned as an end-user library review workflow, not only endpoint documentation.
- **Data confidence without backup expansion**: PASS. P3 export is a readable asset catalog/metadata index and explicitly excludes original media files.
- **Testable acceptance**: PASS. Each user story maps to request/UI flows and measurable success criteria.

## Project Structure

### Documentation (this feature)

```text
specs/002-mvp-next-steps/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contract.md
│   └── ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app.ts
├── config/
├── middleware/
├── migrations/
├── routes/
│   ├── assets.routes.ts
│   ├── library.routes.ts        # planned
│   └── index.ts
├── services/
│   ├── database.service.ts
│   ├── image.service.ts
│   ├── storage.service.ts
│   ├── video.service.ts
│   └── library.service.ts       # planned
├── types/
│   ├── assets.types.ts
│   └── library.types.ts         # planned
├── ui/                          # planned lightweight MVP web UI
│   ├── index.html
│   ├── app.ts
│   └── styles.css
└── utils/

tests/                           # planned if absent
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Keep a single application process and repository package. Add `src/ui/` for the lightweight browser MVP and serve it from the existing application. Add `library.routes.ts`, `library.service.ts`, `library.types.ts`, and migrations only for the missing MVP product capabilities. Avoid a separate frontend package until the MVP proves it needs independent build, routing, or dependency complexity.

## Complexity Tracking

No constitution violations or unjustified complexity. The only new structural addition is a lightweight UI folder inside the current TypeScript application, chosen to avoid creating a separate frontend app before the MVP product loop is validated.

## Phase 0: Research

Research is complete in [research.md](./research.md). It resolves MVP architecture, UI packaging, organization persistence, query/filter behavior, import outcome handling, health/status checks, summary export scope, and testing strategy.

## Phase 1: Design & Contracts

Design artifacts are complete:

- [data-model.md](./data-model.md): Defines Personal Library, Media Asset View, Import Result, Asset Metadata, Organization Marker, Library Health, and Library Summary Export.
- [contracts/api-contract.md](./contracts/api-contract.md): Defines the planned HTTP behavior for batch import outcomes, library listing/filtering, detail, organization markers, health, export, and delete behavior.
- [contracts/ui-contract.md](./contracts/ui-contract.md): Defines the MVP browser UI states and workflows for import, browsing, filtering, detail, organization, health, export, and delete confirmation.
- [quickstart.md](./quickstart.md): Describes how to validate the MVP plan and run implementation checks.

## Post-Design Constitution Check

The feature-specific gates remain satisfied:

- **Personal-product scope**: PASS. Data model and contracts do not introduce users, teams, public sharing, or hosted accounts.
- **Fastest MVP path**: PASS. Contracts extend current endpoints and service behavior rather than replacing the backend foundation.
- **User-facing review loop**: PASS. UI contract covers the P1 review loop end to end.
- **Data confidence without backup expansion**: PASS. Export contract explicitly excludes original media files and positions output as catalog/metadata index.
- **Testable acceptance**: PASS. Quickstart and contracts define concrete validation steps matching all success criteria.
