# Lenbrary Product

**Purpose**: Capture product positioning, target users, workflows, business objectives, scope boundaries, and unresolved business decisions for Lenbrary as a personal product.  
**Audience**: Maintainers, product stakeholders, and contributors planning a personal media asset management product for photography/media enthusiasts.  
**Last reviewed**: 2026-05-06  
**Scope**: Product baseline inferred from the current repository and documentation.  
**Non-scope**: This document does not finalize market strategy or introduce new runtime behavior.

## Evidence Status

- **Verified fact**: The current server supports media ingestion, local storage, duplicate detection, thumbnails, metadata extraction, listing, retrieval, deletion, migrations, and container deployment.
- **Confirmed positioning**: The initial product is for photography and media asset management enthusiasts managing personal collections.
- **Open question**: The exact first enthusiast workflow and user experience depth are not yet confirmed.

## Product Positioning

Lenbrary is a personal media asset management product for photography and media-organization enthusiasts. Today it is implemented as a local or self-hosted media asset backend that helps an individual preserve original image and video files, avoid duplicate uploads, create useful previews, and retain technical metadata for future discovery, organization, and review workflows.

The current product promise is a trustworthy personal media foundation: reliable ingestion, original preservation, deduplication, previews, and rich metadata. A full visual library experience is an expected product direction, but the current repository first establishes the backend foundation before adding gallery, search, tagging, curation, or backup/export workflows.

## MVP Direction

The next MVP is a personal media library review loop for one enthusiast in a trusted private environment. The MVP starts with import, visual browsing, basic filtering, asset detail, original-file access, and confirmed deletion. This is the shortest path from the current backend foundation to a usable personal product.

The second increment adds lightweight organization with favorites and free-form tags. The third increment adds personal data confidence through library health and a readable summary export. The export is a catalog and metadata index for audit, migration planning, and backup planning; it does not include original media files and is not a backup/restore system.

## Value Proposition

- Reduce friction for an enthusiast collecting images and videos into a consistent personal library.
- Preserve original files while generating lightweight previews for faster personal review.
- Surface structured photo/video metadata that would otherwise remain hidden inside media files.
- Avoid duplicate storage through content-based detection.
- Provide a foundation for personal browsing, search, tagging, albums, filtering, backup/export, and collection hygiene.

## Target User Segments

- **Primary segment**: Photography and media asset management enthusiasts managing personal image/video collections.
- **Strong-fit subsegment**: Photographers and camera enthusiasts who care about EXIF, camera/lens data, capture settings, film simulations, and original file preservation.
- **Secondary segment**: Personal content creators who need a durable local library for mixed images and videos.
- **Non-initial segments**: Small teams, public sharing workflows, hosted SaaS customers, and developer-platform users.

## Primary Workflows

- **Media ingestion**: Upload an image or video and receive an asset record with file information and derived data when available.
- **Duplicate avoidance**: Upload a file that already exists and receive the existing asset instead of creating another stored copy.
- **Metadata review**: Inspect image EXIF or video metadata associated with an asset.
- **Asset browsing**: List assets by page and optionally by media type.
- **Asset retrieval**: Retrieve asset details, original files, and thumbnails.
- **Asset removal**: Delete an asset and its associated stored files.
- **Future personal organization**: Search, filter, tag, group, and review assets around personal collection needs.
- **MVP review loop**: Import, browse, filter, inspect, organize lightly, check health, and export a catalog/metadata index.

## Business Objectives

- **BO-001: Personal collection confidence**: An enthusiast can upload images/videos and trust that originals, previews, duplicate status, and core metadata are preserved.
  - Indicator: Upload workflow returns asset identity, duplicate status when applicable, thumbnail availability when processing succeeds, and metadata availability when extraction succeeds.
  - Evidence needed: Manual or automated workflow checks.
- **BO-002: Metadata-led organization**: A photographer can inspect meaningful image/video metadata and use it as the basis for future search, filtering, and organization.
  - Indicator: Documentation and workflow checks confirm camera, lens, timestamp, capture settings, video technical fields, and raw metadata expectations.
  - Evidence needed: Sample media review with representative cameras and video files.
- **BO-003: Better personal roadmap decisions**: A proposed feature can be classified as in scope, out of scope, or requiring clarification in under 10 minutes.
  - Indicator: Reviewers can apply the decision criteria in this document without reading source code.
  - Evidence needed: Roadmap review examples.
- **BO-004: Maintainable personal operation**: A maintainer can identify operational dependencies, persistence locations, and backup concerns before trusting Lenbrary with a personal collection.
  - Indicator: Deployment review identifies local database, upload directories, temporary storage, and media-processing dependencies.
  - Evidence needed: Self-hosting review or deployment checklist.

## Scope Boundaries

### In Scope Today

- Image and video ingestion.
- Local storage of original media and thumbnails.
- Content-hash duplicate detection.
- Image EXIF extraction.
- Video metadata extraction.
- Asset listing, retrieval, file streaming, thumbnail retrieval, and deletion.
- Local database persistence and migrations.
- Self-hosted container operation.
- Product direction for personal browsing, metadata review, collection hygiene, search, tagging, grouping, and backup/export.

### Out Of Scope Until Clarified

- Multi-tenant hosting.
- User accounts, roles, permissions, or access control.
- Remote sharing links and collaboration.
- Backup and restore as a product guarantee.
- Retention policy or archival lifecycle.
- Legal, privacy, copyright, or compliance workflows.
- Multi-user team asset management.
- Hosted SaaS operation.
- Public publishing or collaboration-first workflows.
- Professional DAM features such as approval workflows, licensing, rights management, or client delivery portals.
- Editing or destructive media transformation workflows.

## Roadmap Decision Criteria

Classify a proposed feature as **in scope** when it strengthens personal media asset management: ingestion reliability, metadata quality, duplicate handling, storage safety, asset retrieval, migration safety, local/private operation, personal browsing, search, tagging, grouping, collection hygiene, or backup/export.

Classify a proposed feature as **out of scope** when it primarily serves hosted multi-user behavior, team collaboration, public publishing, professional DAM workflows, compliance programs, or developer-platform use before the personal enthusiast product is strong.

Classify a proposed feature as **needs clarification** when it changes deployment exposure, data retention expectations, backup responsibility, privacy posture, media organization model, or the balance between photographer-specific and general media workflows.

## Business Goal Clarification Questions

1. **First enthusiast workflow**
   - Recommended default: Ingestion, duplicate avoidance, thumbnail preview, and metadata inspection.
   - Alternatives: Gallery browsing, search/filtering, tagging/albums, backup/export.
   - Implications: Determines the first user-facing experience beyond the backend.
   - Priority: Scope.

2. **Deployment posture**
   - Recommended default: Local or private self-hosted deployment for personal collections.
   - Alternatives: LAN access, public network service, hosted SaaS.
   - Implications: Changes security, identity, backup, operational support, and compliance expectations.
   - Priority: Security/privacy.

3. **Source of product value**
   - Recommended default: Original preservation, deduplication, previews, metadata, and personal collection hygiene.
   - Alternatives: Search and discovery, visual curation, publishing, backup/archive.
   - Implications: Changes which workflows should be optimized first.
   - Priority: Scope.

4. **Metadata role**
   - Recommended default: Metadata is both inspectable and a future driver for search, filtering, and smart groupings.
   - Alternatives: Metadata remains descriptive only, or metadata becomes analytics/automation input.
   - Implications: Changes data modeling, indexing, and user-facing discovery requirements.
   - Priority: User experience.

5. **Data durability promise**
   - Recommended default: The operator is responsible for host backups and storage durability.
   - Alternatives: Built-in backup, export, restore, replication, or retention policy.
   - Implications: Changes operational scope and risk ownership.
   - Priority: Security/privacy.

6. **Access model**
   - Recommended default: Single personal user in a trusted private environment.
   - Alternatives: Single-user auth, household/LAN access, multi-user roles, API tokens, public read-only access.
   - Implications: Changes every asset access and deletion workflow.
   - Priority: Security/privacy.

## Stakeholder Review Prompts

- Which personal enthusiast workflow should be optimized first?
- What user workflow would make the product valuable before a full gallery exists?
- Which out-of-scope item must become in scope before broader deployment?
- Which business objective should be measured first?
- What risk would stop a user from trusting Lenbrary with a personal photo/video collection?

## Maintenance Guidance

Review this document whenever product positioning, target user, deployment exposure, security posture, supported workflow, or roadmap priority changes.
