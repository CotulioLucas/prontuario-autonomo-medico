# Skill: Domain Modeling

=================================================================

## 1. Purpose

Design a precise, stable, and technology-independent representation of the business domain, ensuring that business rules, concepts, and behaviors are explicitly modeled and enforced.

This skill exists to prevent anemic domains, procedural business logic, and framework-driven designs.

=================================================================

## 2. Applicability

This skill MUST be executed after:

- Business Analysis completion
- Stakeholder validation
- Objective formalization

And before:

- Architecture definition
- Database modeling
- API design
- Source code creation

=================================================================

## 3. Mandatory Inputs

Required sources:

- docs/content/business-problem.md
- docs/content/strategic-objectives.md
- docs/content/assumptions.md
- docs/03-requirements/*
- Stakeholder interviews

Incomplete inputs invalidate modeling.

=================================================================

## 4. Core Responsibilities

The executing agent SHALL:

1. Identify core domain concepts
2. Define entities and value objects
3. Establish aggregate boundaries
4. Define domain invariants
5. Model domain behaviors
6. Identify domain events
7. Establish ubiquitous language
8. Define bounded contexts
9. Eliminate technical leakage
10. Validate model with business stakeholders

=================================================================

## 5. Required Deliverables

The following artifacts MUST be produced:

docs/domain/
├── glossary.md
├── entities.md
├── value-objects.md
├── aggregates.md
├── domain-rules.md
├── domain-events.md
├── bounded-contexts.md
└── interaction-maps.md


Absence blocks further work.

=================================================================

## 6. Conceptual Framework

-------------------------------------------------
Entity Identification
-------------------------------------------------

An Entity MUST satisfy:

- Has persistent identity
- Has lifecycle
- Is distinguishable over time

Examples:
- Customer
- Order
- Invoice

-------------------------------------------------
Value Object Identification
-------------------------------------------------

A Value Object MUST:

- Be immutable
- Have no identity
- Be replaceable

Examples:
- Money
- Address
- DateRange

-------------------------------------------------
Aggregate Design
-------------------------------------------------

Each Aggregate MUST:

- Have exactly one root
- Enforce consistency rules
- Protect internal invariants
- Define transactional boundaries

Cross-aggregate transactions are forbidden.

-------------------------------------------------
Domain Events
-------------------------------------------------

A Domain Event MUST:

- Represent a business-relevant occurrence
- Be immutable
- Use past-tense naming

Example:
- OrderPlaced
- PaymentAuthorized

=================================================================

## 7. Operational Process

-------------------------------------------------
Step 1 — Knowledge Extraction
-------------------------------------------------

- Analyze documents
- Extract domain terminology
- Identify implicit rules
- Detect inconsistencies

Produce preliminary concept maps.

-------------------------------------------------
Step 2 — Candidate Model Construction
-------------------------------------------------

- Draft entities and relationships
- Propose aggregates
- Mark uncertainties

No optimization at this stage.

-------------------------------------------------
Step 3 — Language Alignment
-------------------------------------------------

- Validate terminology with stakeholders
- Resolve ambiguities
- Establish canonical names

All documentation MUST use this language.

-------------------------------------------------
Step 4 — Invariant Formalization
-------------------------------------------------

For each invariant define:

- Scope
- Trigger
- Enforcement mechanism
- Failure consequence

Unenforced invariants are invalid.

-------------------------------------------------
Step 5 — Event Modeling
-------------------------------------------------

Identify:

- State transitions
- Business milestones
- External triggers

Map producers and consumers.

-------------------------------------------------
Step 6 — Boundary Validation
-------------------------------------------------

Validate:

- Consistency boundaries
- Latency tolerance
- Failure isolation

Refactor if coupling detected.

-------------------------------------------------
Step 7 — Stakeholder Review
-------------------------------------------------

Simulate real scenarios.

All critical flows must be validated.

=================================================================

## 8. Decision Frameworks

-------------------------------------------------
Entity vs Value Object
-------------------------------------------------

| Criterion        | Entity | Value Object |
|------------------|--------|--------------|
| Identity         | Yes    | No           |
| Mutability       | Yes    | No           |
| Lifecycle        | Yes    | No           |

-------------------------------------------------
Aggregate Split Criteria
-------------------------------------------------

Split if:

- Independent consistency rules
- High contention
- Distinct ownership

-------------------------------------------------
Bounded Context Separation
-------------------------------------------------

Separate if:

- Language diverges
- Rules conflict
- Change frequency differs

=================================================================

## 9. Failure Modes (Anti-Patterns)

Invalid modeling includes:

- Anemic entities
- Service-centric business logic
- ORM-driven design
- God aggregates
- Implicit invariants
- Mixed contexts
- CRUD-only modeling

=================================================================

## 10. Quality Metrics

Evaluate using:

- % business rules in domain layer
- # of anemic entities
- Cross-context dependency count
- Invariant violation frequency
- Event coverage ratio

Targets:
- Anemic entities = 0
- Cross-context deps → minimal

=================================================================

## 11. Validation Protocol

Before completion verify:

- [ ] All entities justified
- [ ] Value objects immutable
- [ ] Aggregates consistent
- [ ] Invariants explicit
- [ ] Events mapped
- [ ] Language unified
- [ ] Contexts isolated

Failures require re-modeling.

=================================================================

## 12. Maturity Levels

Level 1 — Structural  
- Basic entities
- Weak rules

Level 2 — Behavioral  
- Encapsulated logic
- Defined invariants

Level 3 — Strategic  
- Clear contexts
- Event-driven flows

Level 4 — Evolutionary  
- Model adapts to change
- Predictive refactoring

Target: Level 3+

=================================================================

## 13. Exit Criteria

This skill is complete only when:

- All deliverables produced
- Validation protocol passed
- Stakeholder approval recorded
- Versioned artifacts stored

No technical design may begin before exit.
