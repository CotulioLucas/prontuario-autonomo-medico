# Skill: Knowledge Management & Technical Documentation

=================================================================

## 1. Purpose

Establish, maintain, and govern a reliable system of documentation that preserves technical, architectural, and business knowledge throughout the system lifecycle.

This skill exists to prevent knowledge loss, onboarding friction, and undocumented decision-making.

=================================================================

## 2. Applicability

This skill MUST be executed:

- During all project phases
- After major decisions
- After significant refactoring
- During onboarding
- During incident resolution

Documentation is continuous, not archival.

=================================================================

## 3. Mandatory Inputs

Required artifacts:

- docs/content/*
- docs/domain/*
- docs/architecture/*
- docs/05-security/*
- docs/04-decisions/adr/*
- quality/*
- infra/runbooks/*

Missing inputs invalidate documentation governance.

=================================================================

## 4. Core Responsibilities

The executing agent SHALL:

1. Maintain system documentation
2. Preserve decision rationale
3. Document architectural patterns
4. Track domain evolution
5. Maintain operational playbooks
6. Ensure documentation accuracy
7. Enable efficient onboarding
8. Support audits and reviews
9. Govern documentation lifecycle
10. Prevent documentation drift

=================================================================

## 5. Required Deliverables

The following artifacts MUST be produced:

docs/
├── content/
├── domain/
├── database/
├── api/
├── architecture/
├── 05-security/
├── 06-devops/
├── onboarding/
├── runbooks/
└── knowledge-base.md


Absence blocks system certification.

=================================================================

## 6. Documentation Engineering Framework

-------------------------------------------------
Single Source of Truth
-------------------------------------------------

Each knowledge artifact MUST have:

- One authoritative location
- Clear ownership
- Version control
- Change history

Duplication is prohibited.

-------------------------------------------------
Decision Traceability
-------------------------------------------------

All major decisions MUST:

- Reference business drivers
- Link to ADRs
- Record alternatives
- Document consequences

-------------------------------------------------
Living Documentation
-------------------------------------------------

Docs MUST:

- Be updated with code
- Be reviewed periodically
- Be validated in CI
- Reflect current behavior

-------------------------------------------------
Audience Segmentation
-------------------------------------------------

Documentation MUST address:

- Engineers
- Product managers
- Operators
- Security reviewers
- Auditors

Tailor depth accordingly.

-------------------------------------------------
Operational Playbooks
-------------------------------------------------

Runbooks MUST include:

- Symptoms
- Diagnostics
- Mitigation steps
- Escalation paths
- Recovery procedures

-------------------------------------------------
Knowledge Retention
-------------------------------------------------

Critical knowledge MUST be:

- Centralized
- Searchable
- Indexed
- Redundant

-------------------------------------------------
Documentation Automation
-------------------------------------------------

Where possible, generate from:

- Code annotations
- API schemas
- IaC definitions
- Test reports

Manual-only docs discouraged.

=================================================================

## 7. Operational Process

-------------------------------------------------
Step 1 — Documentation Inventory
-------------------------------------------------

Catalog all existing documents.

Identify gaps and redundancies.

-------------------------------------------------
Step 2 — Ownership Assignment
-------------------------------------------------

Assign:

- Primary owner
- Secondary owner
- Review cadence

-------------------------------------------------
Step 3 — Standardization
-------------------------------------------------

Apply:

- Templates
- Naming conventions
- Taxonomy

-------------------------------------------------
Step 4 — Synchronization
-------------------------------------------------

Integrate docs with:

- CI pipelines
- Review processes
- Release workflows

-------------------------------------------------
Step 5 — Validation
-------------------------------------------------

Verify:

- Accuracy
- Completeness
- Accessibility

-------------------------------------------------
Step 6 — Onboarding Optimization
-------------------------------------------------

Create:

- Learning paths
- Starter guides
- System maps

-------------------------------------------------
Step 7 — Review & Pruning
-------------------------------------------------

Archive obsolete material.

Maintain relevance.

=================================================================

## 8. Decision Frameworks

-------------------------------------------------
Detail Level
-------------------------------------------------

| Audience    | Depth        |
|-------------|--------------|
| New hire    | High         |
| Maintainer  | Medium       |
| Auditor     | High         |
| Executive   | Low          |

-------------------------------------------------
Manual vs Generated Docs
-------------------------------------------------

| Context          | Preferred  |
|------------------|------------|
| APIs             | Generated  |
| Architecture     | Manual     |
| Configs          | Generated  |
| Runbooks         | Manual     |

=================================================================

## 9. Failure Modes (Anti-Patterns)

Invalid documentation practices include:

- Outdated docs
- Orphaned ADRs
- Tribal knowledge
- Duplicate sources
- Unowned documents
- Inaccessible formats

=================================================================

## 10. Quality Metrics

Track:

- Documentation coverage ratio
- Update latency
- Onboarding time
- Search success rate
- Review compliance

Targets defined by governance.

=================================================================

## 11. Validation Protocol

Before approval verify:

- [ ] All domains documented
- [ ] ADRs linked
- [ ] Runbooks complete
- [ ] Onboarding guides tested
- [ ] Docs searchable
- [ ] Owners assigned
- [ ] Reviews scheduled

Failures block certification.

=================================================================

## 12. Maturity Levels

Level 1 — Ad-Hoc  
- Scattered docs

Level 2 — Organized  
- Central repository

Level 3 — Governed  
- Lifecycle management

Level 4 — Institutionalized  
- Knowledge-driven culture

Target: Level 3+

=================================================================

## 13. Exit Criteria

This skill is complete only when:

- All deliverables exist
- Validation protocol passed
- Knowledge base indexed
- Governance approved
- Review cycle active

No system handover without compliance.
