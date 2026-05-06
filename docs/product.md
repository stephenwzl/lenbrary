# Lenbrary Product

**Purpose**: Capture product positioning, target users, workflows, business objectives, scope boundaries, and unresolved business decisions for Lenbrary.  
**Audience**: Maintainers, product stakeholders, and contributors planning roadmap changes.  
**Last reviewed**: 2026-05-06  
**Scope**: Product baseline inferred from the current repository and documentation.  
**Non-scope**: This document does not finalize market strategy or introduce new runtime behavior.

## Evidence Status

- **Verified fact**: The current server supports media ingestion, local storage, duplicate detection, thumbnails, metadata extraction, listing, retrieval, deletion, migrations, and container deployment.
- **Assumption**: The first product audience is local or self-hosted maintainers who need a media asset backend.
- **Open question**: Final business positioning and user model are not yet confirmed.

## Product Positioning

Lenbrary is best described today as a local or self-hosted media asset backend. It helps users preserve original image and video files, avoid duplicate uploads, create useful previews, and retain technical metadata that can support future discovery, organization, or automation workflows.

The current product promise is infrastructure reliability and media understanding, not a full visual library experience. This distinction matters because roadmap decisions should first strengthen ingestion, metadata integrity, storage safety, and maintainability before assuming gallery, collaboration, or hosted-product requirements.

## Value Proposition

- Reduce friction in collecting images and videos into a consistent asset store.
- Preserve original files while generating lightweight previews for faster review.
- Extract structured metadata that would otherwise remain hidden inside media files.
- Avoid duplicate storage through content-based detection.
- Provide a clear backend foundation for future media browsing, search, or automation features.

## Target User Segments

- **Primary current segment, assumed**: A technical maintainer or self-hosting user managing personal or local media collections.
- **Secondary possible segment**: Photographers or content creators who care about EXIF, camera settings, lens data, and original file preservation.
- **Developer segment**: Application developers who need a media ingestion and metadata backend for another product.
- **Future possible segment**: Small teams needing shared asset infrastructure, pending decisions about identity, permissions, and sharing.

## Primary Workflows

- **Media ingestion**: Upload an image or video and receive an asset record with file information and derived data when available.
- **Duplicate avoidance**: Upload a file that already exists and receive the existing asset instead of creating another stored copy.
- **Metadata review**: Inspect image EXIF or video metadata associated with an asset.
- **Asset browsing**: List assets by page and optionally by media type.
- **Asset retrieval**: Retrieve asset details, original files, and thumbnails.
- **Asset removal**: Delete an asset and its associated stored files.

## Business Objectives

- **BO-001: Faster onboarding**: A new contributor can understand the product baseline and current scope in under 20 minutes.
  - Indicator: Contributor answers 8 of 10 baseline questions from documentation alone.
  - Evidence needed: Maintainer or contributor review.
- **BO-002: Better roadmap decisions**: A proposed feature can be classified as in scope, out of scope, or requiring clarification in under 10 minutes.
  - Indicator: Reviewers can apply the decision criteria in this document without reading source code.
  - Evidence needed: Roadmap review examples.
- **BO-003: Media organization value**: Users can preserve media files with useful derived previews and metadata while avoiding duplicate storage.
  - Indicator: Upload workflow returns asset identity, duplicate status when applicable, thumbnail availability when processing succeeds, and metadata availability when extraction succeeds.
  - Evidence needed: Manual or automated workflow checks.
- **BO-004: Maintainable self-hosting**: A maintainer can identify operational dependencies, persistence locations, and backup concerns before deployment.
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

### Out Of Scope Until Clarified

- Multi-tenant hosting.
- User accounts, roles, permissions, or access control.
- Remote sharing links and collaboration.
- Backup and restore as a product guarantee.
- Retention policy or archival lifecycle.
- Legal, privacy, copyright, or compliance workflows.
- Full frontend gallery, albums, tagging, search, editing, or curation workflows.

## Roadmap Decision Criteria

Classify a proposed feature as **in scope** when it strengthens the current baseline: ingestion reliability, metadata quality, duplicate handling, storage safety, asset retrieval, migration safety, documentation, or local/self-hosted operation.

Classify a proposed feature as **out of scope** when it assumes hosted multi-user behavior, public sharing, identity, compliance, or full gallery workflows without first resolving the relevant business questions.

Classify a proposed feature as **needs clarification** when it changes target audience, deployment exposure, data retention expectations, backup responsibility, privacy posture, or the meaning of media organization.

## Business Goal Clarification Questions

1. **Primary user**
   - Recommended default: Technical self-hosting user managing local media.
   - Alternatives: Photographer, small team, developer platform.
   - Implications: Determines whether UX, metadata depth, access control, or integration contracts dominate the roadmap.
   - Priority: Scope.

2. **Deployment posture**
   - Recommended default: Local or private self-hosted deployment.
   - Alternatives: Public network service, hosted SaaS, embedded backend.
   - Implications: Changes security, identity, backup, operational support, and compliance expectations.
   - Priority: Security/privacy.

3. **Source of product value**
   - Recommended default: Reliable ingestion, original preservation, deduplication, previews, and metadata.
   - Alternatives: Search and discovery, collaboration, publishing, archival compliance.
   - Implications: Changes which workflows should be optimized first.
   - Priority: Scope.

4. **Metadata role**
   - Recommended default: Metadata is descriptive and useful for inspection.
   - Alternatives: Metadata drives search, filtering, smart collections, automation, or analytics.
   - Implications: Changes data modeling, indexing, and user-facing discovery requirements.
   - Priority: User experience.

5. **Data durability promise**
   - Recommended default: The operator is responsible for host backups and storage durability.
   - Alternatives: Built-in backup, export, restore, replication, or retention policy.
   - Implications: Changes operational scope and risk ownership.
   - Priority: Security/privacy.

6. **Access model**
   - Recommended default: Trusted environment with no product-level identity promise.
   - Alternatives: Single-user auth, multi-user roles, API tokens, public read-only access.
   - Implications: Changes every asset access and deletion workflow.
   - Priority: Security/privacy.

## Stakeholder Review Prompts

- Which user segment is the product optimizing for first?
- What user workflow would make the project valuable even without a full frontend?
- Which out-of-scope item must become in scope before broader deployment?
- Which business objective should be measured first?
- What risk would block external users from adopting Lenbrary?

## Maintenance Guidance

Review this document whenever product positioning, target user, deployment exposure, security posture, supported workflow, or roadmap priority changes.
