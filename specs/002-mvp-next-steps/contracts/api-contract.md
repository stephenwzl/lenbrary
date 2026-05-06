# API Contract: MVP Next Steps

## Scope

This contract describes the planned service behavior needed for the MVP personal media library. It extends the current asset service with user-facing library concepts while preserving existing media storage, thumbnail, metadata, file, and delete behavior.

## Shared Response Shape

Successful JSON responses should use:

```json
{
  "success": true,
  "data": {}
}
```

Failure responses should use plain user-facing messages and keep implementation details out of the response body.

```json
{
  "success": false,
  "error": "User-readable message"
}
```

## Existing Asset Endpoints To Preserve

- `POST /api/assets/upload`
- `GET /api/assets`
- `GET /api/assets/:id`
- `GET /api/assets/:id/file`
- `GET /api/assets/:id/thumbnail`
- `GET /api/assets/:id/exif`
- `DELETE /api/assets/:id`

Existing behavior remains valid, but response data may be enriched with metadata, health, favorite, and tags when that supports the MVP.

## Batch Import Outcome

### `POST /api/library/import`

Accepts multiple media files and returns per-file outcomes. This may be implemented directly or represented by UI aggregation over repeated single-file uploads, but the user-visible contract must match this outcome model.

**Response**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "inputName": "IMG_0001.JPG",
        "status": "accepted",
        "assetId": 1,
        "message": "Imported",
        "mediaType": "image",
        "metadataAvailable": true,
        "thumbnailAvailable": true
      },
      {
        "inputName": "IMG_0001-copy.JPG",
        "status": "duplicate",
        "assetId": 1,
        "message": "Already in library",
        "mediaType": "image",
        "metadataAvailable": true,
        "thumbnailAvailable": true
      }
    ]
  }
}
```

**Rules**

- `status` is one of `accepted`, `duplicate`, `unsupported`, `failed`, `processing-pending`.
- Duplicate outcomes must reference the existing asset when known.
- Unsupported and failed outcomes must not create broken asset records.

## Library Listing And Filtering

### `GET /api/library/assets`

Returns media assets for the visual library, with filters for MVP browsing.

**Query parameters**

- `limit`: page size.
- `offset`: pagination offset.
- `type`: `image` or `video`.
- `favorite`: `true` or `false`.
- `tag`: tag label.
- `dateFrom`, `dateTo`: import or capture date range.
- `camera`: camera make/model filter when metadata is available.
- `hasThumbnail`: `true` or `false`.
- `hasMetadata`: `true` or `false`.

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "originalName": "IMG_0001.JPG",
      "mediaType": "image",
      "mimeType": "image/jpeg",
      "fileSize": 1234567,
      "importedAt": 1760000000000,
      "captureDate": "2026-05-01T10:00:00Z",
      "thumbnailAvailable": true,
      "thumbnailUrl": "/api/assets/1/thumbnail",
      "fileAvailable": true,
      "fileUrl": "/api/assets/1/file",
      "metadataAvailable": true,
      "favorite": false,
      "tags": ["family", "x100v"],
      "processingHealth": "normal"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

## Library Asset Detail

### `GET /api/library/assets/:id`

Returns the detail view model for one asset.

**Response**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "originalName": "IMG_0001.JPG",
    "mediaType": "image",
    "fileUrl": "/api/assets/1/file",
    "thumbnailUrl": "/api/assets/1/thumbnail",
    "fileAvailable": true,
    "thumbnailAvailable": true,
    "duplicateIdentity": "sha256-value",
    "favorite": true,
    "tags": ["portfolio"],
    "metadata": {
      "metadataType": "image",
      "captureDate": "2026-05-01T10:00:00Z",
      "cameraMake": "Fujifilm",
      "cameraModel": "X100V",
      "lensModel": "23mm",
      "rawAvailable": true
    },
    "processingHealth": "normal"
  }
}
```

## Organization Markers

### `PUT /api/library/assets/:id/favorite`

Sets favorite state.

**Request**

```json
{
  "favorite": true
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "assetId": 1,
    "favorite": true
  }
}
```

### `PUT /api/library/assets/:id/tags`

Replaces the asset's free-form tag list.

**Request**

```json
{
  "tags": ["family", "x100v"]
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "assetId": 1,
    "tags": ["family", "x100v"]
  }
}
```

**Rules**

- Empty tag labels are ignored or rejected with a clear validation message.
- Duplicate labels for the same asset collapse to one tag.
- Deleting an asset removes its organization markers.

## Library Health

### `GET /api/library/health`

Returns read-only collection status.

**Response**

```json
{
  "success": true,
  "data": {
    "assetCounts": {
      "total": 200,
      "image": 150,
      "video": 50
    },
    "issueCounts": {
      "missingThumbnails": 2,
      "missingMetadata": 18,
      "missingOriginals": 0
    },
    "duplicateCount": 12,
    "storageGuidance": {
      "originals": "Configured upload storage",
      "thumbnails": "Configured thumbnail storage",
      "database": "Configured database path"
    },
    "checkedAt": 1760000000000
  }
}
```

## Library Summary Export

### `GET /api/library/export`

Exports a readable asset catalog and metadata index. Original media files are excluded.

**Response**

The response should be downloadable as a readable structured document. The content must include:

- Export timestamp.
- Library summary counts.
- Asset identity and original names.
- File references, not file bytes.
- Available metadata fields.
- Favorite state and tags.
- Explicit exclusion statement for original media files.

**Rules**

- Must not include original media file bytes.
- Must be readable with a general-purpose viewer.
- Must support audit, migration planning, and backup planning.

## Delete Behavior

Delete may continue to use `DELETE /api/assets/:id`, but the MVP UI must treat it as a confirmed destructive action. The response must allow the UI to show whether deletion succeeded or failed. When deletion succeeds, organization markers tied to the asset must no longer appear.
