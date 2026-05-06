# Lenbrary Project Knowledge

**Purpose**: Provide a shared baseline for what Lenbrary is, what exists today, and what decisions still shape the personal media-management product.  
**Audience**: Project maintainer, future contributors, and stakeholders building a personal product for photography and media asset management enthusiasts.  
**Last reviewed**: 2026-05-06  
**Scope**: Current repository baseline for the Lenbrary server.  
**Non-scope**: This document does not define new runtime behavior, external contracts, schema changes, deployment changes, or final business strategy.

## Evidence Status

- **Verified fact**: Confirmed from repository artifacts listed in the evidence map.
- **Assumption**: Reasonable interpretation of current project direction when repository evidence or stakeholder input is incomplete.
- **Open question**: A product, business, or architecture decision that needs explicit confirmation.
- **Recommended decision**: A default choice proposed to keep planning moving until replaced by stakeholder input.

## What Lenbrary Is

Lenbrary is a personal media asset management product for photography and media-organization enthusiasts. The current implementation is a local or self-hosted server for image and video files, providing ingestion, storage, metadata extraction, thumbnail generation, duplicate detection, listing, retrieval, and deletion for media assets.

The current repository provides the backend foundation for that personal product. It is not yet a complete end-user gallery application; the existing user interface is generated endpoint documentation and service endpoints, not a dedicated media browsing frontend.

## Intended Audience

The primary audience is an individual photography or media asset management enthusiast who wants to preserve, inspect, and organize a personal image/video collection with strong metadata awareness. Contributors and maintainers are secondary users who build and operate the product. Small teams, developer-platform use, and hosted multi-user scenarios are not the initial target.

## Current Capabilities

- **Media upload**: Accepts uploaded files and stores originals under a configured upload directory.
- **Image and video support**: Detects file type and accepts image and video media.
- **Duplicate detection**: Calculates a file hash and returns an existing asset when the same binary content has already been uploaded.
- **Thumbnail generation**: Generates thumbnails for supported images and videos when media processing succeeds.
- **Image metadata**: Extracts broad EXIF metadata for image assets, including camera, lens, capture settings, timestamps, GPS fields, Fuji film-mode fields, and raw metadata.
- **Video metadata**: Extracts video metadata such as duration, codecs, bitrates, frame rate, HDR fields, stream counts, and raw metadata.
- **Asset listing and retrieval**: Lists assets with pagination and optional type filtering; retrieves single assets, original files, thumbnails, and image EXIF metadata.
- **Deletion**: Deletes asset records and removes associated original and thumbnail files.
- **Local persistence**: Stores file records and metadata in a local database file and stores media files on the local filesystem.
- **Migrations**: Includes ordered schema migrations for initial tables, indexes, file hashes, extended EXIF fields, and video metadata.
- **Endpoint documentation**: Serves generated documentation for the available service endpoints.
- **Container deployment**: Provides container and compose configuration for self-hosted operation.

## Vocabulary

- **Asset**: A stored media item with identity, original filename, stored filename, file location, media type, size, dimensions, hash, and creation time.
- **Metadata**: Information extracted from a media file. Image metadata includes EXIF fields; video metadata includes duration, codecs, frame rate, HDR, and stream fields.
- **Thumbnail**: A smaller derived image used to preview an asset without reading or rendering the original file.
- **Duplicate**: A newly uploaded file whose binary hash matches an existing asset.
- **Storage**: Local filesystem directories for original media files, thumbnails, temporary uploads, and the local database file.
- **Migration**: A versioned database change that moves the local schema forward or backward.
- **Endpoint documentation**: Generated documentation that describes service endpoints and request or response behavior.

## Current Limitations And Non-Goals

- Authentication, authorization, identity, and user permissions are not defined in the current baseline.
- Remote sharing, collaboration, multi-user workflows, and multi-tenant hosting are not current product promises.
- Backup, restore, retention, archival, and disaster recovery policy are not defined as product behavior.
- Compliance posture for privacy, copyright, retention, or regulated data is not defined.
- Search beyond list filtering, tagging, albums, editing, rating workflows, and rich discovery are not established baseline capabilities.
- The project is not positioned as a hosted SaaS product, team DAM system, or complete visual media library application yet.

## Risks And Operational Dependencies

- Local file persistence means data durability depends on host volume, filesystem permissions, and backup discipline.
- Media-processing steps can fail for unsupported, corrupt, very large, or unusual files; the upload flow should remain understandable when derived metadata or thumbnails are absent.
- EXIF and video metadata vary heavily by camera, software, codec, and container format, so fields may be sparse or inconsistent.
- The undefined auth and sharing posture is acceptable for a trusted personal setup but limits safe exposure beyond private environments.
- Schema drift is possible because the initial schema file and later migrations both describe database shape; maintainers should treat migrations as the source of history.
- Container operation depends on external media tools and mounted volumes being available in the runtime environment.

## Open Questions

- Which enthusiast workflow should come first: ingestion, metadata inspection, browsing, search, tagging, albuming, or backup/export?
- Should the personal product optimize first for photographers' EXIF/camera workflows or broader mixed media organization?
- Should authentication and authorization be required before exposing assets outside localhost or a trusted private network?
- What is the expected backup and restore policy for media files and the local database?
- Should metadata become a discovery and search surface, or remain descriptive information attached to assets?
- What media volume should the project optimize for: small personal collections, large photo archives, or team-scale libraries?

## Recommended Defaults

- Treat the current product as a personal local/self-hosted product for photography and media asset management enthusiasts.
- Treat authentication, sharing, backup, retention, and compliance as out of scope for the current baseline but high-priority decisions before broader exposure.
- Treat generated thumbnails and extracted metadata as best-effort derived data; original assets and asset records are the core durable product value.

## Evidence Map

- `README.md`: Product summary, quickstart, feature list, environment variables, endpoint overview, and project structure.
- `package.json`: Runtime, commands, dependencies, and project type.
- `src/app.ts`: Application assembly, CORS, request logging, generated endpoint documentation, and route mounting.
- `src/routes/assets.routes.ts`: Upload, duplicate handling, list, retrieve, file streaming, thumbnail retrieval, EXIF retrieval, and deletion behavior.
- `src/services/storage.service.ts`: Local original and thumbnail storage responsibilities.
- `src/services/image.service.ts`: Image processing and EXIF extraction responsibilities.
- `src/services/video.service.ts`: Video thumbnail and metadata responsibilities.
- `src/services/database.service.ts`: Asset, EXIF, and video metadata persistence operations.
- `src/types/assets.types.ts`: Asset, image metadata, and video metadata concepts.
- `src/migrations/`: Database schema history for assets, file hashes, EXIF expansion, and video metadata.
- `Dockerfile`, `docker-compose.yml`, `Makefile`: Container deployment, local volumes, operational commands, and backup helper behavior.

## Baseline Review Prompts

- Can a reader explain what problem Lenbrary solves in two sentences?
- Can a reader list the current supported media types and derived data?
- Can a reader distinguish current features from future product possibilities?
- Can a reader identify where originals, thumbnails, metadata, and schema history live conceptually?
- Can a reader explain why the first target user is a personal photography/media asset management enthusiast?
- Can a reader name at least three unresolved product decisions for that personal workflow?

## Maintenance Guidance

Review this document whenever supported media types, upload behavior, duplicate detection, metadata fields, storage layout, deployment model, security posture, or product positioning changes.
