# Quickstart: Frontend API Polish

## Purpose

Validate that the enhanced page exposes existing library capabilities and improves interaction quality without expanding product scope.

## Prerequisites

- Node.js >=22.18.0.
- Dependencies installed with `npm install`.
- A personal test library with at least 20 mixed files for import validation.
- A larger seeded or repeated test set sufficient to verify 200-asset pagination/load-more behavior.

## Validation Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Manual Workflow

1. Start the application locally.
2. Open the library page.
3. Import a mixed set containing valid media, duplicates, and unsupported files.
4. Confirm each import queue item shows a visible outcome.
5. Apply at least three filters, identify active filters, clear one, then clear all.
6. Load additional result pages or batches while filters remain active.
7. Open asset detail and confirm grouped file facts, metadata, availability, favorite, tags, original access, and delete controls.
8. Favorite and tag an asset and verify visible card/detail feedback.
9. Delete an asset and confirm the result message and refreshed view.
10. Open library health and verify severity differences for missing originals, thumbnails, and metadata.
11. Trigger export and verify the UI states that original media files are excluded.
12. Repeat key views at desktop and mobile-width sizes and check for overlap or unreadable labels.
13. Confirm the liquid glass style is present without harming usability: translucent panels, backdrop blur, highlight borders, soft shadows, readable contrast, clear focus rings, restrained motion, and no mobile overlap.

## Done Signal

- The page can complete all primary workflows without API documentation.
- Import outcomes are visible per file.
- Active filters are visible and clearable.
- Metadata and health states are understandable.
- Layout remains readable at desktop and mobile-width sizes.
- Liquid glass surfaces are visible and readable across primary workflows.
- No artifact expands the feature into sharing, accounts, hosted service behavior, professional DAM workflows, or backup/restore.
