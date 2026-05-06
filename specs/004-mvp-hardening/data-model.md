# Data Model: MVP Hardening

## Media Import Sample Set

Represents the repeatable media set used to prove import reliability.

**Fields**:

- `id`: Stable fixture identifier.
- `displayName`: Human-readable sample name.
- `fileName`: Filename used during import.
- `mediaKind`: `image`, `video`, `unsupported`, or `damaged`.
- `expectedOutcome`: `accepted`, `duplicate`, `unsupported`, or `failed`.
- `duplicateOf`: Optional fixture id when this file is expected to match existing content.
- `notes`: Why the fixture exists, such as PNG regression, damaged content, or large-file boundary.

**Validation rules**:

- Must include at least 20 files across supported, duplicate, unsupported, damaged, and large-file cases.
- Must include JPEG, PNG, HEIC, MOV, and MP4 coverage when available in the test environment.
- Must avoid private or license-unclear media.

## Import Outcome

Represents the result shown for one imported file.

**Fields**:

- `inputName`: Original selected filename.
- `status`: `queued`, `uploading`, `accepted`, `duplicate`, `unsupported`, `failed`, or `completed`.
- `assetId`: Related managed asset id when accepted or duplicate.
- `mediaType`: Image or video when known.
- `message`: User-facing result explanation.
- `reasonCode`: Optional stable reason for unsupported or failed outcomes.
- `metadataAvailable`: Whether metadata was extracted.
- `thumbnailAvailable`: Whether a preview is available.
- `nextAction`: Optional user guidance, such as retry, inspect original, or skip.

**State transitions**:

- `queued` -> `uploading` -> `accepted`
- `queued` -> `uploading` -> `duplicate`
- `queued` -> `uploading` -> `unsupported`
- `queued` -> `uploading` -> `failed`
- Any final outcome can be summarized as `completed` in aggregate counters without losing the original per-file status.

## Browser Acceptance Run

Represents one repeatable visible MVP validation run.

**Fields**:

- `runId`: Unique run identifier.
- `startedAt` / `finishedAt`: Run timestamps.
- `environment`: Local runtime description useful for diagnosing failures.
- `steps`: Ordered acceptance steps.
- `status`: `passed` or `failed`.
- `durationMs`: Total run time.
- `failureEvidence`: Optional structured evidence for the first or all failures.

**Step fields**:

- `name`: User-visible action under test.
- `expected`: Expected visible outcome.
- `actual`: Observed visible outcome.
- `status`: `passed` or `failed`.
- `visibleMessage`: Relevant UI error/status text.
- `artifact`: Optional screenshot, trace, or log reference when available.

## Asset Selection

Represents the user's current multi-asset selection.

**Fields**:

- `selectedAssetIds`: Ordered or set-like list of selected asset ids.
- `selectionCount`: Count shown to the user.
- `lastSelectedAssetId`: Optional anchor for range or keyboard selection.
- `availableActions`: Batch actions valid for the current selection.

**Validation rules**:

- Selection cannot include non-existent assets after a library refresh.
- Destructive actions require confirmation using current selection count.

## Batch Action Result

Represents the result of applying an action to multiple assets.

**Fields**:

- `action`: `tag`, `favorite`, `unfavorite`, or `delete`.
- `requestedAssetIds`: Assets selected at action start.
- `successes`: Assets successfully changed.
- `failures`: Assets not changed, with reason.
- `message`: User-facing summary.

**State transitions**:

- `ready` -> `confirming` for destructive actions.
- `ready` or `confirming` -> `applying`.
- `applying` -> `completed` when all assets succeed.
- `applying` -> `partial-failure` when some assets fail.
- `applying` -> `failed` when no asset succeeds.

## Browse Group

Represents a visible group of assets in the library browser.

**Fields**:

- `groupMode`: `flat`, `timeline`, `tag`, or `camera`.
- `groupKey`: Stable key such as month, tag name, camera model, or unknown bucket.
- `label`: Human-readable group heading.
- `assetIds`: Assets shown in the group.
- `count`: Number of assets in the group.

**Validation rules**:

- Timeline grouping uses capture date when available, otherwise a clear fallback date.
- Unknown date, camera, or tag values must be grouped under readable unknown buckets.
- Grouping must preserve active filters and detail-opening behavior.

## Health Issue

Represents an actionable data confidence finding.

**Fields**:

- `issueType`: `missing-original`, `missing-thumbnail`, `missing-metadata`, `duplicate-import`, or `export-boundary`.
- `severity`: `info`, `warning`, or `critical`.
- `affectedAssetIds`: Related assets when applicable.
- `summary`: User-facing issue summary.
- `recommendedAction`: Practical action or explanation.
- `isRepairableNow`: Whether the current MVP offers a direct repair action.

**Validation rules**:

- Missing originals are critical.
- Missing thumbnails and metadata are warnings unless combined with missing originals.
- Export boundary issues are informational but must be visible before download.
