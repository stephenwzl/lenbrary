# Data Model: MVP Next Steps

## Personal Library

Represents the user's private collection managed by Lenbrary.

**Fields / derived attributes**:

- `totalAssets`: count of known media assets.
- `imageCount`: count of image assets.
- `videoCount`: count of video assets.
- `duplicateCount`: count of duplicate imports recognized during import reporting or status aggregation.
- `missingThumbnailCount`: count of assets without an available thumbnail.
- `missingMetadataCount`: count of assets with no extractable image/video metadata.
- `missingOriginalCount`: count of asset records whose original file path is no longer readable when checked.
- `storageLocations`: user-facing paths or operator guidance for originals, thumbnails, temporary files, and database records.

**Relationships**:

- Contains many Media Assets.
- Produces Library Health.
- Produces Library Summary Export.

**Validation rules**:

- Health information is read-only in the MVP.
- Missing derived data must not imply the original asset is invalid.

## Media Asset View

User-facing representation of an existing asset plus derived state and organization markers.

**Fields**:

- `id`: stable asset identifier.
- `originalName`: original filename.
- `mediaType`: image or video.
- `mimeType`: detected MIME type.
- `fileSize`: original file size.
- `width`, `height`: dimensions when available.
- `importedAt`: import timestamp.
- `captureDate`: capture/creation date when metadata provides it.
- `thumbnailAvailable`: whether a thumbnail can be displayed.
- `thumbnailUrl`: preview location when available.
- `fileAvailable`: whether original file path is readable when checked.
- `fileUrl`: original-file access location.
- `duplicateIdentity`: file hash or duplicate indicator when relevant.
- `metadata`: Asset Metadata when available.
- `favorite`: boolean organization marker.
- `tags`: zero or more free-form tag labels.
- `processingHealth`: normal, missing-thumbnail, missing-metadata, missing-original, or mixed issue state.

**Relationships**:

- Maps to one existing Asset record.
- Has zero or one image metadata record.
- Has zero or one video metadata record.
- Has zero or more Organization Markers.

**Validation rules**:

- `id`, `originalName`, `mediaType`, `mimeType`, `fileSize`, and `importedAt` are required.
- `thumbnailUrl` must only be shown when thumbnail is available.
- Missing metadata must be represented as unavailable, not as failure.
- Missing original file must be surfaced as a health issue.

## Import Result

Per-file outcome presented after importing a batch.

**Fields**:

- `inputName`: name selected by the user.
- `status`: accepted, duplicate, unsupported, failed, or processing-pending.
- `assetId`: linked asset when accepted or duplicate.
- `message`: plain-language user outcome.
- `mediaType`: image or video when detected.
- `metadataAvailable`: whether metadata was extracted.
- `thumbnailAvailable`: whether preview was generated.

**Relationships**:

- May create one Media Asset.
- May reference one existing Media Asset for duplicate files.

**Validation rules**:

- Unsupported and failed results must not create broken library entries.
- Duplicate results must point to the existing asset when known.
- Processing failures for thumbnail/metadata can still produce an accepted asset if the original was preserved.

## Asset Metadata

User-visible subset of extracted image or video information.

**Fields**:

- `metadataType`: image or video.
- `captureDate`: best available capture/creation date.
- `cameraMake`, `cameraModel`: image metadata when available.
- `lensModel`: image metadata when available.
- `exposureSummary`: user-facing exposure details when available.
- `videoDuration`: video duration when available.
- `videoCodec`: video codec when available.
- `frameRate`: video frame rate when available.
- `rawAvailable`: whether raw metadata exists for deeper inspection/export.

**Relationships**:

- Belongs to one Media Asset View.

**Validation rules**:

- Fields are optional because media metadata is sparse.
- User-facing labels must distinguish unavailable metadata from extraction errors.

## Organization Marker

User-created organization state for a media asset.

**Fields**:

- `assetId`: target asset identifier.
- `favorite`: boolean state.
- `tag`: free-form label.
- `createdAt`: marker creation time.
- `updatedAt`: marker update time when applicable.

**Relationships**:

- Belongs to one Media Asset.
- Tags can be reused across many assets.

**Validation rules**:

- Favorite state is at most one boolean per asset.
- Tag labels must be non-empty after trimming.
- Duplicate tag labels for the same asset should collapse to one marker.
- Removing an asset removes its organization markers.

## Library Health

Read-only status summary for trust and operational visibility.

**Fields**:

- `assetCounts`: total, image, video.
- `issueCounts`: missing thumbnails, missing metadata, missing originals.
- `duplicateCount`: known duplicate import count when available.
- `storageGuidance`: readable storage locations or operator guidance.
- `checkedAt`: time health was evaluated.

**Relationships**:

- Summarizes Personal Library and Media Asset Views.

**Validation rules**:

- Health checks must not modify assets.
- Missing originals are critical issues; missing thumbnails/metadata are warnings.

## Library Summary Export

Readable portable asset catalog and metadata index.

**Fields**:

- `exportedAt`: export timestamp.
- `librarySummary`: asset and health counts.
- `assets`: list of asset records with identity, original name, file references, media type, size, dates, metadata availability, favorite state, and tags.
- `metadata`: selected available metadata for each asset.
- `exclusions`: explicit statement that original media files are not included.

**Relationships**:

- Generated from Personal Library, Media Asset Views, Asset Metadata, Organization Markers, and Library Health.

**Validation rules**:

- Must not include original media file bytes.
- Must be readable with a general-purpose viewer.
- Must contain enough file references for audit, migration planning, or backup planning.

## State Transitions

### Import Result

```text
selected -> uploading -> accepted
selected -> uploading -> duplicate
selected -> uploading -> unsupported
selected -> uploading -> failed
accepted -> processing-pending -> accepted-with-derived-data
accepted -> processing-pending -> accepted-with-processing-warnings
```

### Media Asset

```text
created -> browseable -> detail-viewed
browseable -> marked-favorite
browseable -> tagged
browseable -> deletion-confirmed -> deleted
browseable -> health-warning
```

### Library Summary Export

```text
requested -> generated -> downloaded/readable
requested -> failed-with-user-message
```
