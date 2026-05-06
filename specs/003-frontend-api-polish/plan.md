# Implementation Plan: Frontend API Polish

**Branch**: `003-frontend-api-polish` | **Date**: 2026-05-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-frontend-api-polish/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Improve Lenbrary's existing lightweight browser UI so it exposes the personal media library capabilities already available through the service layer: richer filters, visible active filter state, pagination/loading more, grouped metadata details, clearer import queue outcomes, library health severity, export guidance, and responsive interaction polish. The page should adopt a liquid glass visual system with translucent layered surfaces, backdrop blur, highlight borders, soft depth shadows, restrained motion, and readable contrast. The implementation remains inside the current single-process application and should not introduce public sharing, multi-user behavior, hosted accounts, professional DAM workflows, or full backup/restore.

The technical approach is to keep the current `src/ui/` static UI and `/api/library` service surface, add only the smallest service/API refinements needed for page behavior, and strengthen integration tests around visible page workflows and API-backed UI state. No separate frontend application or new frontend framework is planned for this feature.

## Technical Context

**Language/Version**: Node.js >=22.18.0, TypeScript 5, browser-native HTML/CSS/JavaScript served by the existing app  
**Primary Dependencies**: Existing Express 4 service, SQLite-backed library endpoints, `src/ui/` static files, Vitest, oxlint, TypeScript compiler; no new frontend framework planned  
**Storage**: Existing filesystem originals/thumbnails and SQLite assets, metadata, favorites/tags, import events; no new persistent entity required unless needed for UI state tests  
**Testing**: Existing `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; add targeted UI contract/integration tests for API-backed page behavior and existing endpoint coverage  
**Target Platform**: Local/private self-hosted personal web application in desktop and mobile-width browsers  
**Project Type**: Existing web service with lightweight static browser UI  
**Performance Goals**: 200-asset browsing via pagination/incremental loading without losing filters; three filters applied/identified/cleared in under 30 seconds; 20-file import outcomes all visible  
**Constraints**: Single-user private product; stay in `src/ui/`; liquid glass styling must preserve readability and mobile usability; avoid separate frontend package unless later evidence requires it; no public sharing, multi-user collaboration, hosted accounts, professional review workflows, or full backup/restore  
**Scale/Scope**: Frontend/interaction polish over existing MVP library APIs, with small API additions only for missing UI needs such as filter options or richer status if required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is still the default placeholder template and defines no concrete project principles, gates, or governance rules. This plan applies feature-specific gates from the current product direction:

- **Personal-product scope**: PASS. The planned work remains single-user and private/local.
- **UI completeness over scope expansion**: PASS. The goal is to expose existing library capabilities and improve interactions, not add new product categories.
- **No frontend architecture jump**: PASS. The plan keeps the lightweight `src/ui/` approach until usage proves a separate frontend app is necessary.
- **Data confidence boundary**: PASS. Export remains a catalog/metadata index and not a media backup.
- **Testable UX outcomes**: PASS. Each story has measurable workflow and responsive-layout checks.

## Project Structure

### Documentation (this feature)

```text
specs/003-frontend-api-polish/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-contract.md
│   └── api-support-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── ui/
│   ├── index.html
│   ├── app.ts
│   ├── app.js
│   └── styles.css
├── routes/
│   └── library.routes.ts
├── services/
│   └── library.service.ts
└── types/
    └── library.types.ts

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Keep this as an enhancement to the current app. Primary changes belong in `src/ui/`. Touch `library.routes.ts`, `library.service.ts`, or `library.types.ts` only when the page needs a small missing field, filter, or support response. Keep tests in the existing `tests/` structure.

## Complexity Tracking

No constitution violations or added architectural complexity. The plan deliberately avoids adding a frontend package, router, build tool, auth system, sharing model, or backup workflow.

## Phase 0: Research

Research is complete in [research.md](./research.md). It resolves UI completeness, filter/state behavior, import queue behavior, metadata presentation, responsive ergonomics, and API-support boundaries.

## Phase 1: Design & Contracts

Design artifacts are complete:

- [data-model.md](./data-model.md): Defines Library View State, Filter Set, Import Queue Item, Asset Detail Panel, Feedback Message, and Responsive Layout State.
- [contracts/ui-contract.md](./contracts/ui-contract.md): Defines the enhanced page behavior and interaction states.
- [contracts/api-support-contract.md](./contracts/api-support-contract.md): Defines the existing API support expected by the page and small permissible support extensions.
- [quickstart.md](./quickstart.md): Defines validation workflow across desktop/mobile widths and API-backed interactions.

## Post-Design Constitution Check

The feature-specific gates remain satisfied:

- **Personal-product scope**: PASS. No design artifact introduces multi-user, public sharing, SaaS, professional DAM, or backup/restore behavior.
- **UI completeness over scope expansion**: PASS. Contracts focus on page support for existing library capabilities.
- **No frontend architecture jump**: PASS. Contracts and quickstart keep the current lightweight UI path.
- **Data confidence boundary**: PASS. Export messaging remains catalog/index-only.
- **Testable UX outcomes**: PASS. Quickstart includes concrete functional and responsive checks.
- **Liquid glass readability**: PASS. The visual direction is constrained by workflow clarity, contrast, focus visibility, and mobile non-overlap.
