# API Contract: MVP Hardening

This contract describes the support the page needs from the existing private library surface. Endpoint names are implementation-facing references for planning; user-facing behavior remains the source of truth.

## Import Mixed Media

`POST /api/library/import`

**Purpose**: Import multiple selected files through the browser and return final per-file outcomes.

**Request**:

- Multipart form field `files`.
- One or more files.

**Response**:

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "inputName": "sample.png",
        "status": "accepted",
        "assetId": 12,
        "message": "Imported",
        "mediaType": "image",
        "metadataAvailable": true,
        "thumbnailAvailable": true,
        "nextAction": "Open details"
      }
    ],
    "summary": {
      "total": 20,
      "accepted": 12,
      "duplicate": 2,
      "unsupported": 3,
      "failed": 3
    }
  }
}
```

**Rules**:

- Every uploaded file must receive exactly one final result.
- One failed file must not abort the whole batch.
- Duplicate results should include `assetId` when the existing asset is known.
- Generic 500 responses are not acceptable for expected bad-file or unsupported-file cases.

## Batch Update Tags

`PUT /api/library/assets/batch/tags`

**Purpose**: Apply tags to multiple selected assets.

**Request**:

```json
{
  "assetIds": [1, 2, 3],
  "tags": ["family", "scan"],
  "mode": "add"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "action": "tag",
    "successes": [{"assetId": 1}, {"assetId": 2}],
    "failures": [{"assetId": 3, "message": "Asset not found"}],
    "message": "Tags updated for 2 of 3 assets"
  }
}
```

**Rules**:

- Supports partial success.
- Must return per-asset failure reasons.
- Must not clear unrelated tags unless explicitly requested by a future requirement.

## Batch Favorite

`PUT /api/library/assets/batch/favorite`

**Purpose**: Set favorite state for multiple selected assets.

**Request**:

```json
{
  "assetIds": [1, 2, 3],
  "favorite": true
}
```

**Response**: Same batch result shape as tag updates, with `action` set to `favorite` or `unfavorite`.

## Batch Delete

`DELETE /api/library/assets/batch`

**Purpose**: Delete selected assets after UI confirmation.

**Request**:

```json
{
  "assetIds": [1, 2, 3],
  "confirmed": true
}
```

**Response**: Same batch result shape, with `action` set to `delete`.

**Rules**:

- Requests without `confirmed: true` must be rejected.
- Deleting missing assets should be reported as per-asset failures, not a whole-batch crash.

## Grouped Listing

`GET /api/library/assets?groupBy=timeline|tag|camera|flat`

**Purpose**: Return assets with optional grouping while preserving existing filters and pagination expectations.

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "groupMode": "timeline",
      "groupKey": "2026-05",
      "label": "May 2026",
      "count": 4,
      "assets": []
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

**Rules**:

- Existing ungrouped listing must continue to work.
- Grouping must honor filters for type, favorite, tag, date, camera, thumbnail availability, and metadata availability.
- Unknown values must be represented by readable group labels.

## Health Issues

`GET /api/library/health`

**Purpose**: Return aggregate counts plus actionable issue details.

**Additional response shape**:

```json
{
  "issues": [
    {
      "issueType": "missing-original",
      "severity": "critical",
      "affectedAssetIds": [4],
      "summary": "1 asset is missing its original file",
      "recommendedAction": "Restore the original file from your own backup or remove the stale catalog entry",
      "isRepairableNow": false
    }
  ]
}
```

## Summary Export

`GET /api/library/export`

**Purpose**: Download a catalog/metadata summary.

**Rules**:

- Export must include a visible exclusion statement.
- Export must not include original media files.
- Export should include enough health context to support backup planning and migration review.
