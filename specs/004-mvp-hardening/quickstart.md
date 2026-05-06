# Quickstart: MVP Hardening Validation

## Baseline

1. Confirm the current feature pointer:

   ```bash
   cat .specify/feature.json
   ```

2. Run the existing quality gate:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   npm run test:acceptance
   ```

## Import Reliability Validation

1. Prepare the mixed media fixture set with at least 20 files covering supported images/videos, duplicates, unsupported files, damaged files, zero-byte files, and a larger-file boundary.
2. Start the app locally.
3. Import the fixture set through the browser UI.
4. Verify every file receives one final visible outcome.
5. Repeat the fresh-library import run 5 times and verify no generic crash, unhandled failure screen, or unresolved in-progress item appears.

## React UI Validation

1. Run the production UI build:

   ```bash
   npm run build:ui
   ```

2. During development, run the React dev server when only iterating on UI:

   ```bash
   npm run dev:ui
   ```

3. Confirm the Express app serves built React assets from `dist/ui` after `npm run build`.

## Browser Acceptance Validation

Run the browser acceptance workflow once the test entry point exists. The workflow must cover:

- Import fixture set through the page.
- Browse imported assets.
- Apply and clear filters.
- Open asset detail.
- Select multiple assets.
- Batch tag selected assets.
- Batch favorite/unfavorite selected assets.
- Confirm and perform batch delete.
- Switch flat, timeline, tag, and camera grouping.
- Review health issues.
- Start summary export and verify original-media exclusion messaging.

## Manual Visual QA

Check desktop and mobile-width layouts:

- Import queue rows remain readable for long filenames and mixed statuses.
- Batch selection controls do not obscure asset cards or detail.
- Group headers are scannable and preserve liquid glass styling.
- Health issue rows use severity without relying only on color.
- Export warning is visible before or during download.
- No UI text overlaps or clips critical action labels.

## Scope Guardrail

Before planning implementation tasks, confirm no artifacts add:

- Public sharing
- Multi-user accounts
- Hosted collaboration
- Professional DAM review/approval workflows
- Full backup/restore claims

## Validation Notes

- 2026-05-06: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:acceptance` passed during implementation.
- `npm run lint` still reports the pre-existing warning in `src/utils/encoding.ts` for `eslint(no-control-regex)`; it does not fail the command.
