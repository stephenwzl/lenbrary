# Lenbrary Architecture

**Purpose**: Describe Lenbrary's current system responsibilities, asset lifecycle, data concepts, operational dependencies, deployment context, and known risks for the personal media product.  
**Audience**: Engineers, maintainers, and technical stakeholders planning a personal media asset management product for photography/media enthusiasts.  
**Last reviewed**: 2026-05-06  
**Scope**: Current repository architecture for the Lenbrary server.  
**Non-scope**: This document is not a source-code walkthrough and does not introduce new implementation requirements.

## Evidence Status

- **Verified fact**: Architecture statements are based on repository files listed in the evidence references.
- **Product anchor**: The architecture currently supports a personal local/self-hosted product for photography and media asset management enthusiasts.
- **Open question**: Security, identity, backup, retention, and public network exposure are not architecturally defined as product guarantees.

## System Overview

Lenbrary is currently implemented as a media asset web service backing a personal media management product. It exposes endpoints for uploading, listing, retrieving, previewing, inspecting, and deleting image or video assets. It stores original media files and thumbnails on the local filesystem, stores asset and metadata records in a local database, and uses media-processing tools to derive thumbnails and metadata.

The system is organized around a small set of responsibilities that match the first personal-product needs: application assembly, request routing, upload handling, storage, media processing, persistence, migrations, logging, endpoint documentation, and containerized operation.

## Major Responsibilities

- **Application assembly**: Configures JSON parsing, URL encoding, CORS, request logging, generated endpoint documentation, API routes, not-found handling, and error handling.
- **Routing**: Handles asset upload, listing, detail retrieval, original file streaming, thumbnail streaming, image EXIF retrieval, and deletion.
- **Upload handling**: Accepts multipart file uploads through a temporary upload location.
- **Type detection**: Determines whether the uploaded file is an image or video before accepting it as an asset.
- **Duplicate detection**: Calculates a content hash and returns an existing asset when the uploaded content already exists.
- **Storage**: Writes originals and thumbnails under configured local directories using date-based subdirectories.
- **Image processing**: Generates image thumbnails and extracts EXIF metadata when supported by the media file.
- **Video processing**: Generates video thumbnails and extracts technical video metadata when supported by the media file and processing tools.
- **Persistence**: Stores assets, image metadata, video metadata, and migration records in a local database.
- **Migrations**: Maintains ordered schema change files for database evolution.
- **Logging and errors**: Logs request and processing behavior and returns normalized errors for common failure cases.
- **Endpoint documentation**: Serves generated documentation for available service endpoints.
- **Deployment**: Provides container and compose definitions with local volumes for data, uploads, and temporary files.

## Asset Lifecycle

1. A client uploads a media file.
2. The server receives the file in temporary storage.
3. The server reads the uploaded bytes and calculates a content hash.
4. If the hash already exists, the temporary file is removed and the existing asset is returned.
5. The server detects the media type and rejects unsupported content.
6. The original file is copied into persistent local storage.
7. A thumbnail path is prepared.
8. For images, the server attempts thumbnail generation and EXIF extraction.
9. For videos, the server attempts thumbnail generation and video metadata extraction.
10. An asset record is created with file identity, type, size, dimensions when available, hash, and timestamps.
11. Derived metadata is stored when extraction succeeds.
12. Later requests can list assets, fetch asset details, stream originals, stream thumbnails, inspect image EXIF, or delete the asset.
13. Deletion removes the asset record and attempts to remove original and thumbnail files.

## Data Concepts

- **Asset**: Core persisted record for a media item. Includes original filename, stored filename, file path, thumbnail path, MIME type, media type, size, dimensions, file hash, and creation time.
- **Image metadata**: EXIF-derived fields tied one-to-one to an image asset. Includes camera, lens, timestamp, GPS, capture settings, image details, manufacturer-specific fields, and raw EXIF.
- **Video metadata**: Technical media fields tied one-to-one to a video asset. Includes duration, codecs, bitrates, frame rate, HDR information, stream counts, and raw metadata.
- **File hash**: Content-derived identifier used to detect duplicate uploads.
- **Stored file**: Original media binary written to persistent upload storage.
- **Thumbnail**: Derived preview image written to thumbnail storage.
- **Migration record**: Versioned record of applied schema changes.

## Operational Dependencies

- **Local directories**: Upload, thumbnail, temporary, and data directories must exist and be writable by the runtime.
- **Database file**: The local database path must be writable and backed up by the operator when durability matters.
- **Media-processing tools**: Image and video thumbnail or metadata behavior depends on available processing libraries and bundled system tools.
- **Container runtime**: Container deployment expects mounted volumes for persistent data, uploads, and temporary files.
- **Environment configuration**: Port, upload directory, temporary directory, thumbnail size, database path, CORS origin, and logging level are configurable.
- **Filesystem permissions**: File streaming, deletion, and thumbnail retrieval depend on paths remaining available after upload.

## Deployment Context

The repository includes a container image definition and compose configuration for self-hosted operation. The container installs media-processing system dependencies, builds the server, exposes the service port, and uses mounted directories for persistent data and uploaded media.

The compose configuration maps host directories into the container for data, uploads, and temporary files. This makes deployment simple but places backup and durability responsibility on the operator unless a future product decision changes that promise.

For the confirmed personal-product positioning, this local persistence model is a reasonable starting point: it keeps ownership close to the user and avoids hosted-service complexity. It also means backup/export and data portability become important future product concerns before users rely on Lenbrary as a durable personal library.

## Cross-Cutting Concerns

- **Logging**: Request logging and internal processing logs provide operational visibility.
- **Error handling**: Central error handling maps expected failures such as missing assets, unsupported files, or missing thumbnails to structured responses.
- **CORS**: Cross-origin behavior is configurable and should be revisited before public exposure.
- **Endpoint documentation**: Generated documentation helps developers inspect service behavior.
- **Deduplication**: File hash uniqueness prevents duplicate stored assets for identical content.
- **Data migration**: Versioned migrations record schema evolution beyond the initial schema.
- **Best-effort derived data**: Thumbnail and metadata extraction failures are logged and should not be assumed to invalidate the original asset unless future product policy changes.

## Known Risks And Constraints

- **Local persistence risk**: Original files, thumbnails, and the database depend on local filesystem durability.
- **Backup ambiguity**: Backup and restore are operational helpers, not yet a defined product guarantee.
- **Media-processing failure modes**: Corrupt, unsupported, very large, or unusual media may fail thumbnail or metadata extraction.
- **Metadata variability**: EXIF and video metadata fields vary widely across devices and formats.
- **Undefined auth/security posture**: The current baseline fits a trusted personal environment but does not define user identity, permissions, or asset-level access control.
- **CORS exposure risk**: Broad CORS settings may be acceptable locally but should be reviewed for networked deployment.
- **Schema drift**: The initial schema and migrations both describe data shape; maintainers should reason from applied migrations when evaluating live databases.
- **Filesystem consistency**: Database records can point to files that no longer exist if files are moved or deleted outside the service.

## Evidence References

- `src/app.ts`: Application assembly, middleware, documentation, routes, and error handling.
- `src/routes/assets.routes.ts`: Asset lifecycle at the endpoint layer.
- `src/services/storage.service.ts`: Original and thumbnail file storage.
- `src/services/image.service.ts`: Image thumbnail and EXIF responsibilities.
- `src/services/video.service.ts`: Video thumbnail and metadata responsibilities.
- `src/services/database.service.ts`: Asset and metadata persistence.
- `src/services/migration.service.ts`: Migration loading, status, application, and rollback behavior.
- `src/types/assets.types.ts`: Core asset and metadata concepts.
- `src/migrations/`: Schema history.
- `src/config/index.ts`: Runtime configuration.
- `Dockerfile`, `docker-compose.yml`, `Makefile`: Deployment and operational context.

## Architecture Review Prompts

- Did a new feature change the asset lifecycle or derived-data assumptions?
- Did a schema change require updating data concepts or migration notes?
- Did deployment exposure change enough to require authentication, authorization, or CORS review?
- Did supported media types or metadata extraction behavior change?
- Did backup, restore, retention, or compliance become a product promise?
- Did the personal-product roadmap add search, tagging, albums, or backup/export expectations that require new architecture?

## Maintenance Guidance

Review this document whenever routing, storage, media processing, persistence, migrations, deployment, security posture, or supported media behavior changes.
