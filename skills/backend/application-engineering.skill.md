# Skill: Application Engineering (Backend)

=================================================================

## 1. Purpose

Implement application services and use cases that faithfully execute domain behavior, preserve business invariants, and remain independent from delivery mechanisms and infrastructure.

This skill exists to prevent procedural scripting, fat controllers, and domain leakage.

=================================================================

## 2. Applicability

This skill MUST be executed after:

- Domain Modeling completion
- System Architecture approval
- Security baseline definition

And before:

- Public API exposure
- Infrastructure hardening
- Production deployment

=================================================================

## 3. Mandatory Inputs

Required artifacts:

- docs/domain/domain-rules.md
- docs/domain/aggregates.md
- docs/domain/domain-events.md
- docs/architecture/components.md
- docs/architecture/style.md
- docs/architecture/adr/*

Missing inputs invalidate implementation.

=================================================================

## 4. Core Responsibilities

The executing agent SHALL:

1. Implement application use cases
2. Orchestrate domain objects
3. Enforce transaction boundaries
4. Manage authorization contexts
5. Coordinate domain events
6. Handle error propagation
7. Isolate infrastructure concerns
8. Preserve domain invariants
9. Support idempotent execution
10. Maintain deterministic behavior

=================================================================

## 5. Required Deliverables

The following artifacts MUST be produced:

src/**/application/
├── use-cases/
├── commands/
├── queries/
├── ports/
└── dto/


Structure may vary by architecture.

=================================================================

## 6. Application Design Framework

-------------------------------------------------
Use Case Structure
-------------------------------------------------

Each use case MUST:

- Have a single responsibility
- Represent one business action
- Be transactionally consistent
- Be independently testable

Example:

CreateOrder  
CancelSubscription  
ApprovePayment

-------------------------------------------------
Command / Query Separation
-------------------------------------------------

Rules:

- Commands mutate state
- Queries are read-only
- Queries must not trigger events

-------------------------------------------------
Port & Adapter Pattern
-------------------------------------------------

All external dependencies MUST be abstracted via ports.

Examples:

- Repository ports
- Messaging ports
- Payment ports

-------------------------------------------------
Transaction Management
-------------------------------------------------

Define explicitly:

- Begin
- Commit
- Rollback
- Compensation (if needed)

No implicit transactions allowed.

-------------------------------------------------
Error Modeling
-------------------------------------------------

Errors MUST be:

- Domain-specific
- Typed
- Predictable
- Mapped to outcomes

No generic exceptions.

=================================================================

## 7. Operational Process

-------------------------------------------------
Step 1 — Use Case Identification
-------------------------------------------------

Map:

- Business capabilities
- Actor actions
- Event triggers

Each capability → one or more use cases.

-------------------------------------------------
Step 2 — Input Contract Design
-------------------------------------------------

Define:

- Required fields
- Validation rules
- Authorization context

Reject invalid input early.

-------------------------------------------------
Step 3 — Domain Interaction Modeling
-------------------------------------------------

Specify:

- Aggregate loading
- State transitions
- Invariant checks

No business logic in orchestration.

-------------------------------------------------
Step 4 — Infrastructure Boundary Definition
-------------------------------------------------

Route:

Persistence → repositories  
Messaging → event ports  
External APIs → gateways

Never inline integrations.

-------------------------------------------------
Step 5 — Event Publication
-------------------------------------------------

Define:

- Event payload
- Ordering rules
- Delivery guarantees

Ensure idempotency.

-------------------------------------------------
Step 6 — Authorization Enforcement
-------------------------------------------------

Evaluate:

- Actor permissions
- Resource ownership
- Context constraints

Security must precede execution.

-------------------------------------------------
Step 7 — Observability Injection
-------------------------------------------------

Add:

- Structured logs
- Trace IDs
- Metrics hooks

Do not pollute domain.

-------------------------------------------------
Step 8 — Determinism Validation
-------------------------------------------------

Ensure:

- Same input → same outcome
- No hidden state
- No time coupling

-------------------------------------------------
Step 9 — Review & Refactoring
-------------------------------------------------

Continuously validate alignment with domain.

=================================================================

## 8. Decision Frameworks

-------------------------------------------------
Service vs Use Case
-------------------------------------------------

| Criterion            | Service | Use Case |
|----------------------|---------|----------|
| Business action      | High    | Primary  |
| Technical concern    | High    | Low      |
| Orchestration focus  | Low     | High     |

Prefer Use Cases.

-------------------------------------------------
Sync vs Async Execution
-------------------------------------------------

| Context              | Pattern |
|----------------------|---------|
| Immediate feedback   | Sync    |
| Long processing      | Async   |
| Event-driven flows   | Async   |

=================================================================

## 9. Failure Modes (Anti-Patterns)

Invalid implementations include:

- Fat controllers
- Transaction scripts
- God services
- Business logic in adapters
- Repository leakage
- Framework annotations in domain
- Unbounded side effects

=================================================================

## 10. Quality Metrics

Monitor:

- % business logic in domain
- Use case cyclomatic complexity
- Dependency inversion violations
- Transaction failure rate
- Event delivery failures

Targets:

- Domain logic ≥ 70%
- Complexity ≤ defined threshold

=================================================================

## 11. Validation Protocol

Before approval verify:

- [ ] Use cases isolated
- [ ] Ports defined
- [ ] No framework leakage
- [ ] Errors modeled
- [ ] Transactions explicit
- [ ] Events documented
- [ ] Authorization enforced

Failures require redesign.

=================================================================

## 12. Maturity Levels

Level 1 — Procedural  
- Script-like services

Level 2 — Structured  
- Isolated use cases

Level 3 — Domain-Centric  
- Rich models
- Clean boundaries

Level 4 — Autonomous  
- Event-driven orchestration
- Self-healing flows

Target: Level 3+

=================================================================

## 13. Exit Criteria

This skill is complete only when:

- All use cases implemented
- Validation protocol passed
- Architecture compliance verified
- Security review completed
- Artifacts versioned

No public exposure allowed before exit.
