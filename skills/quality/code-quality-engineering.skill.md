# Skill: Code Quality & Maintainability Engineering

=================================================================

## 1. Purpose

Establish and enforce structural, semantic, and evolutionary quality standards that ensure long-term maintainability, extensibility, and reliability of the codebase.

This skill exists to prevent uncontrolled complexity, technical debt accumulation, and architectural erosion.

=================================================================

## 2. Applicability

This skill MUST be executed:

- During all development activities
- During refactoring initiatives
- During dependency upgrades
- Before major releases
- During incident remediation

Quality is continuous, not periodic.

=================================================================

## 3. Mandatory Inputs

Required artifacts:

- docs/architecture/style.md
- docs/architecture/components.md
- docs/architecture/adr/*
- docs/domain/domain-rules.md
- .cursor/rules/*

Missing inputs invalidate quality governance.

=================================================================

## 4. Core Responsibilities

The executing agent SHALL:

1. Enforce coding standards
2. Control complexity
3. Prevent architectural drift
4. Manage technical debt
5. Optimize readability
6. Maintain modularity
7. Control dependency growth
8. Promote refactoring discipline
9. Ensure documentation accuracy
10. Support sustainable velocity

=================================================================

## 5. Required Deliverables

The following artifacts MUST be produced:

quality/
├── code-standards.md
├── refactoring-guidelines.md
├── dependency-policy.md
├── complexity-budgets.md
├── tech-debt-register.md
└── review-checklists.md


Absence blocks major changes.

=================================================================

## 6. Quality Engineering Framework

-------------------------------------------------
Code Readability
-------------------------------------------------

All code MUST:

- Express intent clearly
- Minimize cognitive load
- Use domain terminology
- Avoid cleverness

-------------------------------------------------
Complexity Management
-------------------------------------------------

Define limits for:

- Cyclomatic complexity
- Nesting depth
- File size
- Class size

Exceeding limits requires refactoring.

-------------------------------------------------
Modularity Enforcement
-------------------------------------------------

Modules MUST:

- Have single responsibility
- Expose minimal interfaces
- Hide internal details
- Respect architectural boundaries

-------------------------------------------------
Dependency Governance
-------------------------------------------------

Rules:

- No unused dependencies
- No transitive leaks
- Version upgrades tracked
- Security reviewed

-------------------------------------------------
Refactoring Discipline
-------------------------------------------------

Refactoring MUST:

- Preserve behavior
- Be test-backed
- Be incremental
- Be documented

-------------------------------------------------
Documentation Synchronization
-------------------------------------------------

Docs MUST:

- Reflect current behavior
- Be updated with code
- Be reviewed periodically

-------------------------------------------------
Review Protocol
-------------------------------------------------

Reviews MUST evaluate:

- Design clarity
- Domain alignment
- Risk exposure
- Maintainability impact

=================================================================

## 7. Operational Process

-------------------------------------------------
Step 1 — Baseline Establishment
-------------------------------------------------

Define:

- Current complexity profile
- Dependency graph
- Technical debt inventory

-------------------------------------------------
Step 2 — Budget Allocation
-------------------------------------------------

Set:

- Complexity budgets
- Dependency budgets
- Refactoring quotas

-------------------------------------------------
Step 3 — Continuous Inspection
-------------------------------------------------

Execute:

- Static analysis
- Linting
- Architecture tests
- Dependency scans

-------------------------------------------------
Step 4 — Debt Management
-------------------------------------------------

Classify debt as:

- Strategic
- Tactical
- Accidental

Assign owners and deadlines.

-------------------------------------------------
Step 5 — Refactoring Execution
-------------------------------------------------

Plan:

- Scope
- Risk
- Validation
- Rollback

-------------------------------------------------
Step 6 — Evolution Review
-------------------------------------------------

Analyze:

- Change impact
- Module stability
- Churn patterns

-------------------------------------------------
Step 7 — Knowledge Preservation
-------------------------------------------------

Capture:

- Design rationale
- Non-obvious decisions
- Trade-offs

=================================================================

## 8. Decision Frameworks

-------------------------------------------------
Refactor vs Rewrite
-------------------------------------------------

| Criterion           | Refactor | Rewrite |
|---------------------|----------|---------|
| Domain stability    | High     | Low     |
| Test coverage       | High     | Low     |
| Technical debt load | Medium   | High    |

-------------------------------------------------
Abstraction Level
-------------------------------------------------

| Context             | Strategy        |
|---------------------|-----------------|
| Volatile logic      | Low abstraction |
| Stable core         | High abstraction|

=================================================================

## 9. Failure Modes (Anti-Patterns)

Invalid quality practices include:

- Cargo-cult patterns
- Over-abstraction
- Premature optimization
- Neglected refactoring
- Unbounded dependencies
- Outdated documentation

=================================================================

## 10. Quality Metrics

Track:

- Maintainability index
- Code churn rate
- Dependency count
- Refactoring ratio
- Review rejection rate

Targets defined by governance.

=================================================================

## 11. Validation Protocol

Before approval verify:

- [ ] Complexity within limits
- [ ] Architecture respected
- [ ] Dependencies approved
- [ ] Debt tracked
- [ ] Docs updated
- [ ] Reviews completed
- [ ] Budgets respected

Failures block release.

=================================================================

## 12. Maturity Levels

Level 1 — Fragile  
- Ad-hoc standards
- Growing debt

Level 2 — Disciplined  
- Defined policies
- Managed refactoring

Level 3 — Sustainable  
- Predictable evolution
- Low erosion

Level 4 — Antifragile  
- Continuous improvement
- Self-healing architecture

Target: Level 3+

=================================================================

## 13. Exit Criteria

This skill is complete only when:

- All deliverables exist
- Validation protocol passed
- Debt within thresholds
- Architecture compliance verified
- Governance approval obtained

No major change allowed before exit.
