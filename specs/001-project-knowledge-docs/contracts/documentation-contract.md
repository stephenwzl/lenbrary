# Documentation Contract: Project Knowledge Docs

## Scope

This contract defines the required shape and acceptance checks for the documentation deliverables produced by this feature.

## Deliverables

The implementation must create these repository-root documents:

- `docs/project-knowledge.md`
- `docs/product.md`
- `docs/architecture.md`

## Shared Markdown Contract

Each document must include:

- A clear title and short purpose statement.
- Intended audience.
- Last reviewed date.
- Scope and non-scope boundaries.
- Verified facts separated from assumptions and open questions.
- Maintenance or review guidance.
- Project-relative evidence references where factual claims depend on repository artifacts.

Each document must avoid:

- Secrets, tokens, private credentials, or sensitive local machine paths.
- Unexplained placeholders such as `TODO`, `TBD`, or template bracket text.
- Claims that current behavior exists without either evidence or an explicit assumption label.

## Project Knowledge Document Contract

`docs/project-knowledge.md` must include:

- What Lenbrary is.
- Who the current audience is.
- Current capability summary.
- Domain vocabulary.
- Current limitations and risks.
- Open questions.
- Repository evidence map.
- Baseline review prompts.

Acceptance checks:

- A new contributor can summarize the project purpose, users, current capabilities, non-goals, and open questions after reading it.
- Key terms include asset, metadata, thumbnail, duplicate, storage, and migration.

## Product Document Contract

`docs/product.md` must include:

- Product positioning and value proposition.
- Target user segments.
- Primary workflows.
- Business objectives with measurable indicators.
- Scope boundaries and non-goals.
- Roadmap decision criteria.
- Business-goal clarification questions with recommended defaults and implications.

Acceptance checks:

- Contains at least three measurable business objectives.
- Contains at least five unresolved product or business decisions when evidence is insufficient.
- Supports an in-scope, out-of-scope, or needs-clarification decision for proposed features.

## Architecture Document Contract

`docs/architecture.md` must include:

- System overview.
- Major responsibilities.
- Asset lifecycle.
- Data concepts.
- Operational dependencies.
- Deployment context.
- Cross-cutting concerns.
- Known risks and constraints.
- Architecture review prompts.

Acceptance checks:

- Covers upload handling, storage, metadata extraction, persistence, routing, documentation, logging, migrations, and deployment.
- Lists at least five risks or constraints.
- Remains readable as architecture documentation rather than a source-code walkthrough.

## Validation Contract

Before the feature is considered complete:

- Placeholder scan must return no unresolved template markers in `docs/`.
- Documents must be readable without running the application.
- All current capability claims must be traceable to repository evidence or marked as assumptions.
- Documentation must not require application tests because runtime behavior is unchanged.
