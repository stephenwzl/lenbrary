# API Support Contract: Frontend API Polish

## Scope

This feature primarily improves the page. Existing service endpoints remain the main backend contract. Small additions are allowed only when required to support visible UI behavior.

## Existing Endpoints The Page Must Use

- `POST /api/assets/upload`: upload individual files and receive accepted or duplicate outcomes.
- `GET /api/library/assets`: list assets with filters and pagination.
- `GET /api/library/assets/:id`: fetch detail view model.
- `PUT /api/library/assets/:id/favorite`: set favorite state.
- `PUT /api/library/assets/:id/tags`: replace tags.
- `DELETE /api/assets/:id`: delete assets.
- `GET /api/library/health`: fetch library health.
- `GET /api/library/export`: download catalog/metadata index.

## Required UI-Support Behavior

### Listing

The listing response must support:

- Pagination or load-more through `limit`, `offset`, and `hasMore`.
- Filters for media type, favorite state, tag, camera, date range, thumbnail availability, and metadata availability.
- Stable fields for cards: id, original name, media type, import/capture date, thumbnail availability, metadata availability, favorite, tags, and processing health.

### Detail

The detail response must support:

- Original-file URL.
- Thumbnail URL or missing-preview state.
- File facts.
- Duplicate identity when available.
- Favorite and tags.
- Groupable photo/video metadata.
- Processing health.

### Mutations

Favorite, tag, and delete actions must return enough information for the page to update visible state and show feedback without requiring a full reload when practical.

### Health

Health response must distinguish:

- Missing originals.
- Missing thumbnails.
- Missing metadata.
- Duplicate import count.
- Asset counts by type.

### Export

Export response must remain a catalog/metadata index and must not include original media file bytes.

## Permissible Small Extensions

- Add available filter option summaries such as known tags or cameras if manual text entry proves insufficient.
- Add affected asset ids for health categories if needed to connect health warnings to browsing.
- Add user-facing action messages to mutation responses.

## Out Of Scope

- New authentication, public sharing, multi-user accounts, hosted accounts, professional approval workflows, or media backup packaging.
