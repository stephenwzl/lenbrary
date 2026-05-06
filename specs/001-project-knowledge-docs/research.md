# Research: Project Knowledge Docs

## Decision 1: Documentation Location

**Decision**: Store durable project documentation under a new root-level `docs/` directory, while keeping planning artifacts under `specs/001-project-knowledge-docs/`.

**Rationale**: The `specs/` directory is feature-planning oriented and may contain transient planning artifacts. The requested output is portable project, product, and architecture documentation that should be easy to discover from the repository root and maintain beyond this feature.

**Alternatives considered**:

- Keep all documentation in `specs/001-project-knowledge-docs/`: rejected because future readers may not know to look inside a feature directory.
- Expand `README.md` only: rejected because README already serves quickstart and API overview needs; adding product and architecture depth would make it harder to scan.

## Decision 2: Documentation Scope

**Decision**: Produce three documents: `docs/project-knowledge.md`, `docs/product.md`, and `docs/architecture.md`.

**Rationale**: The user requested project cognition, portable product and architecture documentation, and business-goal clarification. Splitting by reader intent keeps each document focused: shared context, product decisions, and technical architecture.

**Alternatives considered**:

- Single comprehensive handbook: rejected because it mixes stakeholder, product, and engineering concerns.
- Many small documents: rejected because the current project baseline is compact and excessive fragmentation would increase maintenance cost.

## Decision 3: Evidence Model

**Decision**: Separate verified repository facts, assumptions, open questions, and recommended next decisions in the documents.

**Rationale**: Existing repository evidence proves current implementation capabilities but does not prove final business positioning. Separating evidence status prevents accidental overclaiming and makes unresolved strategy visible.

**Alternatives considered**:

- Treat all inferred product goals as confirmed: rejected because it would create false certainty.
- Block planning until all business goals are clarified: rejected because the requested documentation itself is meant to organize those clarifications.

## Decision 4: Architecture Detail Level

**Decision**: Document responsibilities, data flow, operational dependencies, and risks without deep code walkthroughs or implementation instructions.

**Rationale**: The architecture document should help future planning and onboarding without duplicating source files. It must be understandable to engineers and useful to product stakeholders who need system constraints.

**Alternatives considered**:

- Low-level module-by-module reference: rejected because it becomes stale quickly and is not needed for business-goal clarification.
- High-level product-only overview: rejected because the request explicitly includes architecture documentation.

## Decision 5: Validation Method

**Decision**: Validate documentation with Markdown review prompts, placeholder scans, and evidence-trace checks rather than application tests.

**Rationale**: This is a documentation-only feature and should not require runtime changes. The success criteria focus on reader comprehension, scope assessment, and traceability.

**Alternatives considered**:

- Add automated application tests: rejected because no runtime behavior changes are planned.
- Rely on manual proofreading only: rejected because placeholder and evidence checks reduce avoidable documentation drift.
