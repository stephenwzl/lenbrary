# Browser Acceptance Contract: MVP Hardening

## Purpose

Provide repeatable evidence that the visible MVP path works through the browser, not only through lower-level service tests.

## Required Acceptance Flow

1. Start from a fresh local library.
2. Open the library page.
3. Import the mixed media fixture set through the visible file chooser or drag/drop target.
4. Confirm every file receives a final visible outcome.
5. Confirm accepted and duplicate outcomes can open related asset details when an asset id exists.
6. Apply filters for media type, metadata availability, thumbnail availability, favorite, tag, camera, and date where fixture data supports them.
7. Select multiple assets.
8. Apply batch tags and verify selected assets reflect the change.
9. Apply batch favorite state and verify selected assets reflect the change.
10. Confirm and perform a batch delete.
11. Switch between flat, timeline, tag, and camera group modes.
12. Open a detail panel from a grouped asset.
13. Open health status and verify actionable issue presentation.
14. Start summary export and verify the original-media exclusion is visible before or during export.

## Pass Criteria

- The flow completes in under 5 minutes on a typical local development machine.
- No step ends with a generic crash, unhandled rejection, unresolved loading state, or invisible failure.
- Each failed assertion records:
  - Step name
  - Expected visible state
  - Actual visible state
  - Visible error/status text
  - Optional screenshot or trace artifact when available

## Fixture Requirements

- At least 20 total files.
- Includes JPEG, PNG, HEIC, MOV, and MP4 when the runtime can support those fixtures.
- Includes duplicate content, unsupported content, damaged content, zero-byte content, and at least one larger file boundary.
- Fixtures must be safe to commit or generated reproducibly during test setup.

## Non-Goals

- Does not prove hosted, multi-user, or public-network operation.
- Does not prove original-media backup or restore.
- Does not replace lower-level contract, integration, and unit tests.
