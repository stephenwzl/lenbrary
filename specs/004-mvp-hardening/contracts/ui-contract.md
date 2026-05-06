# UI Contract: MVP Hardening

## React Ownership

- The browser UI is owned by React components under `src/ui/react/`.
- React state must own filters, selected asset ids, import queue rows, batch result feedback, grouping mode, detail panel state, health state, and export warning state.
- The static HTML file must only provide the mount shell and compatibility selectors needed by tests or non-script fallback.

## Import Queue

- The page must show queued, uploading, accepted, duplicate, unsupported, failed, and completed states.
- Every selected file must remain visible until it reaches a final outcome.
- Accepted and duplicate rows must offer a path to open asset detail when an asset id is available.
- Failed and unsupported rows must include practical guidance without hiding successful imports.
- The import summary must show total, accepted, duplicate, unsupported, failed, and completed counts.

## Batch Selection

- Asset cards must support multi-select without breaking single asset detail opening.
- The page must show the current selection count.
- Batch actions must include tag, favorite/unfavorite, and delete.
- Destructive batch delete must require confirmation that names the affected count.
- Batch result feedback must distinguish full success, partial success, and full failure.

## Grouped Browsing

- The page must support flat, timeline, tag, and camera modes.
- Group headers must show readable labels and counts.
- Unknown dates, tags, and cameras must use clear fallback labels.
- Active filters and selected asset detail must survive grouping changes where the asset remains visible.

## Health And Data Confidence

- Health status must show aggregate counts and actionable issue rows.
- Missing originals must read as more severe than missing thumbnails or missing metadata.
- Issue rows must show affected asset context when available.
- Export messaging must clearly state that original media files are excluded from the summary export.

## Liquid Glass Usability

- New controls must match the existing liquid glass style: translucent surfaces, blur, highlight borders, depth, semantic status color, and visible focus states.
- Text must remain readable on desktop and mobile-width layouts.
- Selection controls, group headers, import rows, and batch action controls must not overlap or resize unpredictably.
- Reduced-motion behavior must remain respected.
