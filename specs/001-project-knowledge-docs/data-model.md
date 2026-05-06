# Data Model: Project Knowledge Docs

## Entity: Documentation Set

**Purpose**: The complete portable documentation baseline for project cognition, product framing, architecture understanding, and business-goal clarification.

**Fields**:

- `title`: Human-readable name of the documentation set.
- `documents`: References to the included Project Knowledge Document, Product Document, and Architecture Document.
- `evidence_sources`: Repository artifacts used to support factual claims.
- `review_status`: Draft, reviewed, or needs-update.
- `last_reviewed`: Date when maintainers last checked accuracy.
- `update_triggers`: Events that require review, such as capability changes, schema changes, deployment changes, or product-goal decisions.

**Relationships**:

- Contains three primary documents.
- References many evidence sources.
- Tracks many open questions and business goals.

**Validation Rules**:

- Must include all three primary documents.
- Must identify whether factual claims are verified, assumed, or unresolved.
- Must avoid secrets and machine-specific sensitive paths.

## Entity: Project Knowledge Document

**Purpose**: Shared baseline for what Lenbrary is, current capabilities, vocabulary, limitations, risks, and reader orientation.

**Fields**:

- `purpose`
- `audience`
- `current_capabilities`
- `domain_vocabulary`
- `current_limitations`
- `risks`
- `open_questions`
- `evidence_sources`

**Validation Rules**:

- Must allow a new contributor to explain the project without reading source code.
- Must distinguish current behavior from future opportunities.
- Must define key terms such as asset, metadata, thumbnail, duplicate, storage, and migration.

## Entity: Product Document

**Purpose**: Product-facing explanation of target users, workflows, value proposition, scope boundaries, business objectives, and decision criteria.

**Fields**:

- `target_users`
- `primary_workflows`
- `value_proposition`
- `business_objectives`
- `scope_boundaries`
- `non_goals`
- `decision_criteria`
- `business_goal_questions`
- `recommended_defaults`

**Validation Rules**:

- Must include at least three measurable business objectives.
- Must include at least five unresolved product or business decisions when repository evidence is insufficient.
- Must support in-scope, out-of-scope, and needs-clarification decisions for proposed features.

## Entity: Architecture Document

**Purpose**: Engineering-readable but portable description of current system responsibilities, data flow, operational dependencies, and known risks.

**Fields**:

- `system_overview`
- `major_responsibilities`
- `data_concepts`
- `asset_lifecycle`
- `operational_dependencies`
- `deployment_context`
- `cross_cutting_concerns`
- `known_risks`
- `maintenance_notes`

**Validation Rules**:

- Must cover upload handling, storage, metadata extraction, persistence, routing, documentation, logging, migrations, and deployment.
- Must identify at least five risks or constraints.
- Must avoid becoming a line-by-line source-code reference.

## Entity: Business Goal

**Purpose**: A measurable outcome the product may pursue.

**Fields**:

- `goal`
- `metric`
- `current_status`
- `evidence_needed`
- `related_workflows`

**Validation Rules**:

- Must be measurable.
- Must be technology-agnostic.
- Must state whether it is confirmed, assumed, or proposed.

## Entity: Open Question

**Purpose**: A decision that needs stakeholder confirmation because repository evidence is insufficient.

**Fields**:

- `question`
- `category`
- `recommended_default`
- `alternatives`
- `implications`
- `priority`

**Validation Rules**:

- Must include implications, not just the question.
- Must be prioritized by scope, security/privacy, user experience, then technical detail.

## Entity: Evidence Source

**Purpose**: A repository artifact or stakeholder statement that supports a documented fact.

**Fields**:

- `source`
- `claim_supported`
- `confidence`
- `notes`

**Validation Rules**:

- Must use project-relative references when recorded in documentation.
- Must not include secrets or local private values.

## Review State Transitions

```text
Draft -> Reviewed
Draft -> Needs Update
Reviewed -> Needs Update
Needs Update -> Reviewed
```

**Transition Rules**:

- `Draft -> Reviewed`: All required sections exist, placeholder scan passes, and evidence status is clear.
- `Reviewed -> Needs Update`: Any current capability, product goal, deployment assumption, or architecture responsibility changes.
- `Needs Update -> Reviewed`: Maintainer updates affected sections and reruns quickstart checks.
