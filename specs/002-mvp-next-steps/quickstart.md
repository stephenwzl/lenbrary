# Quickstart: MVP Next Steps

## Purpose

Use this guide to validate that the MVP plan remains aligned with the personal photography/media asset management goal before generating tasks or implementing code.

## Prerequisites

- Node.js >=22.18.0.
- Repository dependencies installed with `npm install`.
- A small sample set with at least 20 mixed image/video files, including at least one duplicate and at least one file with sparse or missing metadata.

## Planning Review

1. Read [spec.md](./spec.md).
2. Confirm P1 remains the shortest MVP path: import, browse, filter, detail, delete.
3. Confirm P2 remains limited to favorites and free-form tags.
4. Confirm P3 export remains a readable catalog/metadata index and excludes original media files.
5. Confirm public sharing, multi-user accounts, team DAM workflows, and full backup/restore remain out of scope.

## Expected Implementation Checks

Run these checks during implementation:

```bash
npm run lint
npm run typecheck
npm test
```

If UI files are added under the existing TypeScript source tree, make sure they are covered by the selected build path or explicitly copied/served by application setup.

## Manual MVP Workflow Check

1. Start the application locally.
2. Open the MVP library UI.
3. Import the 20-file mixed sample set.
4. Verify every file has an accepted, duplicate, unsupported, failed, or processing-pending outcome.
5. Browse the resulting visual library.
6. Filter by media type and at least one date or metadata dimension.
7. Open an asset detail view.
8. Confirm preview or fallback, original-file access, file facts, metadata, duplicate identity when relevant, and health state.
9. Delete one unwanted asset after confirmation.
10. Add favorite state and tags when P2 is implemented, then filter by them.
11. Open library status and verify counts and warnings.
12. Export the library summary and open it outside Lenbrary.
13. Confirm the export includes asset identity, file references, metadata availability, favorites, and tags, and does not include original media files.

## Done Signal

The plan is ready for task generation when:

- All contracts in `contracts/` map to user stories in `spec.md`.
- Data model entities cover P1, P2, and P3.
- No artifact describes full backup/restore, public sharing, hosted accounts, or professional team workflows as MVP requirements.
- The implementation can be decomposed into independently testable tasks by user story.
