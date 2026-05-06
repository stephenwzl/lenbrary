# Research: Frontend API Polish

## Decision 1: Keep The Lightweight Static UI

**Decision**: Continue improving the existing `src/ui/` static browser UI instead of introducing a separate frontend framework or app package.

**Rationale**: The current UI is small, served by the same application, and directly validates the personal library workflow. The requested work is polish and capability exposure, not a need for complex frontend routing or state architecture.

**Alternatives considered**:

- New frontend app: better for long-term UI scale, but adds build/deploy complexity before the product interaction model is stable.
- Leave UI minimal and rely on API docs: contradicts the user's request and weakens product usability.

## Decision 2: Treat Existing Library APIs As The Main Capability Source

**Decision**: The page should consume existing library endpoints for assets, detail, favorite, tags, health, export, and uploads, adding only small support refinements if the UI needs them.

**Rationale**: The previous MVP already added the core service surface. The gap is discoverability and interaction support in the page, not major backend redesign.

**Alternatives considered**:

- Add broad new APIs before improving UI: increases scope and may not improve user value.
- Hard-code UI-only behavior: risks drift from persisted library state.

## Decision 3: Active Filter Visibility Is Required

**Decision**: The page should show active filters as visible controls or chips and support clearing one filter or all filters.

**Rationale**: Personal media review depends on knowing why assets are currently visible or hidden. Hidden filter state makes the UI feel unreliable.

**Alternatives considered**:

- Basic form controls only: works technically but fails repeated review ergonomics.
- URL-only filter state: useful later but not enough as the visible interaction model.

## Decision 4: Incremental Loading Over Full Library Rendering

**Decision**: Support load-more or pagination for larger libraries instead of rendering all assets at once.

**Rationale**: The success criteria require moving through 200 assets without losing filters. Incremental loading keeps the UI responsive and avoids unnecessary full-page churn.

**Alternatives considered**:

- Render all assets: simplest but fragile for growing personal collections.
- Virtualized scrolling: useful at larger scale, but more complex than needed for this feature.

## Decision 5: Import Queue Should Prefer User Clarity Over Raw Speed

**Decision**: Show each selected file as a queue item with status, message, and linked existing asset when duplicate.

**Rationale**: Import is the highest-trust workflow. Clear status matters more than hiding upload mechanics.

**Alternatives considered**:

- Single summary count only: insufficient for mixed success/failure.
- Modal-only import progress: can obscure browsing and recovery.

## Decision 6: Metadata Display Should Be Grouped And Sparse-Friendly

**Decision**: Show metadata in grouped, readable sections and label unavailable fields as unavailable instead of silently omitting all context.

**Rationale**: Photography/media enthusiasts care about metadata, but EXIF/video fields vary heavily. Grouping improves scanability without pretending every asset has every field.

**Alternatives considered**:

- Raw metadata dump: comprehensive but noisy and not product-quality.
- Only "metadata available/unavailable": too shallow for the product goal.

## Decision 7: Responsive Layout Needs Explicit States

**Decision**: Desktop and mobile-width layouts should be explicitly validated for grid, filter, detail, status, and import states.

**Rationale**: The current UI is functional but minimal. A personal management tool should remain readable and predictable across common screen sizes.

**Alternatives considered**:

- Desktop-only optimization: faster, but the specification requires mobile-width usability.

## Decision 8: Feedback Messages Are First-Class UI State

**Decision**: Success, warning, error, loading, empty, no-results, and destructive-action feedback should be represented consistently across workflows.

**Rationale**: Without visible feedback, users cannot distinguish "nothing happened", "still loading", "no matches", and "failed".

**Alternatives considered**:

- Browser alerts for everything: simple but disruptive and inconsistent.
- Silent optimistic updates: risky for destructive and persistence operations.
