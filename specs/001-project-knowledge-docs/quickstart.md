# Quickstart: Project Knowledge Docs

## Purpose

Use this quickstart to implement and validate the documentation baseline defined by this feature.

## Expected Outputs

Create:

- `docs/project-knowledge.md`
- `docs/product.md`
- `docs/architecture.md`

Use these planning references:

- `specs/001-project-knowledge-docs/spec.md`
- `specs/001-project-knowledge-docs/research.md`
- `specs/001-project-knowledge-docs/data-model.md`
- `specs/001-project-knowledge-docs/contracts/documentation-contract.md`

## Implementation Steps

1. Read current repository evidence:
   - `README.md`
   - `package.json`
   - `src/app.ts`
   - `src/routes/`
   - `src/services/`
   - `src/types/`
   - `src/migrations/`
   - `Dockerfile`
   - `docker-compose.yml`
   - `Makefile`

2. Draft the project knowledge document:
   - Explain what Lenbrary is.
   - Define core vocabulary.
   - Summarize current capabilities, limitations, risks, and open questions.

3. Draft the product document:
   - State target users, workflows, value proposition, and scope boundaries.
   - Add measurable business objectives.
   - Add prioritized business-goal clarification questions with recommended defaults.

4. Draft the architecture document:
   - Describe major responsibilities and the asset lifecycle.
   - Document operational dependencies, deployment context, cross-cutting concerns, and known risks.

5. Validate the documents:

```bash
rg "TODO|TBD|NEEDS CLARIFICATION|\\[.*\\]" docs
```

The command should return no unresolved placeholder text. Bracketed Markdown links are acceptable if manually reviewed.

6. Review acceptance checks:
   - New contributor can answer 8 of 10 baseline questions after 20 minutes.
   - Product document contains at least three measurable business objectives.
   - Product document contains at least five unresolved product or business decisions when evidence is insufficient.
   - Architecture document covers all required system responsibilities.
   - Current-capability claims are evidence-backed or labeled as assumptions.

## Maintenance Trigger

Review the documents whenever any of these change:

- Supported media types.
- Upload, storage, duplicate detection, thumbnail, or metadata behavior.
- Data schema or migration policy.
- Deployment model.
- Security, sharing, authentication, retention, or backup posture.
- Confirmed product positioning or business objectives.
