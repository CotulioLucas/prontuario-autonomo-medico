# Skill: System Architecture

=================================================================

## 1. Purpose

Design a resilient, scalable, secure, and evolvable system architecture derived directly from the validated domain model and business objectives.

This skill exists to prevent accidental complexity, premature optimization, and framework-driven systems.

=================================================================

## 2. Applicability

This skill MUST be executed after:

- Business Analysis completion
- Domain Modeling completion
- Stakeholder validation

And before:

- Source code creation
- Database implementation
- API exposure
- Infrastructure provisioning

=================================================================

## 3. Mandatory Inputs

Required artifacts:

- docs/domain/aggregates.md
- docs/domain/bounded-contexts.md
- docs/domain/domain-events.md
- docs/05-security/threat-model.md (if available)
- docs/content/constraints.md
- docs/content/kpis.md

Missing inputs invalidate architectural work.

=================================================================

## 4. Core Responsibilities

The executing agent SHALL:

1. Select architectural style(s)
2. Define system boundaries
3. Design communication patterns
4. Define dependency directions
5. Establish scalability model
6. Design fault tolerance mechanisms
7. Define security architecture
8. Create architectural decision records (ADRs)
9. Propose modular source structure
10. Validate architectural fitness functions

=================================================================

## 5. Required Deliverables

The following artifacts MUST be produced:

docs/architecture/
├── overview.md
├── style.md
├── components.md
├── deployment-view.md
├── integration-patterns.md
├── quality-attributes.md
├── failure-modes.md
└── adr/
├── adr-001.md
└── ...


No deliverable → no implementation.

-------------------------------------------------
5.1 Mandatory ADR topics
-------------------------------------------------

The following decisions MUST have a dedicated ADR when applicable to the project. Omit only if the topic is out of scope (e.g. no video if the product has no streaming). The executing agent SHALL produce at least one ADR per applicable topic:

| Topic | When applicable | Content to decide |
|-------|-----------------|-------------------|
| Architectural style (and multi-tenant if applicable) | Always | Style selection; multi-tenant strategy (row-level, schema, DB per tenant). |
| Authentication and authorization | Always | Auth provider, session/JWT, tenant and role resolution, authorization model. |
| Inter-context communication | When multiple bounded contexts exist | Sync vs async, events vs direct call, transaction boundaries. |
| External integrations | When product has calendar, messaging, payment, or third-party APIs | Per integration or group: protocol, resilience (timeout, retry), fallback. |
| Security, audit, and compliance (e.g. LGPD) | Always | Trust boundaries, audit trail, secrets, data retention, compliance baseline. |
| Source code / folder structure | Always | Module vs layer organization, mapping contexts to folders, shared vs infrastructure. |
| Persistence and database | Always | SGBD, ORM, tenant isolation (e.g. tenant_id), indexing, migrations, soft delete policy. |
| API design (REST or primary interface) | When exposing API | Versioning, auth on API, error format, pagination, tenant context. |
| Product/infra decisions that affect architecture | When product has streaming, identity verification, document generation, etc. | e.g. Streaming (build vs buy), identity validation (build vs buy), receipt/document format and storage. |
| Testing strategy | Always | Unit vs integration vs E2E; tenant isolation tests; mocking of external integrations. |

Before considering ADRs complete, verify that every applicable row above has a corresponding ADR. Add ADRs for any other major decision not listed.

=================================================================

## 6. Architectural Design Framework

-------------------------------------------------
Architectural Styles
-------------------------------------------------

Candidate styles:

- Layered
- Hexagonal
- Clean Architecture
- Event-Driven
- Microservices
- Modular Monolith
- Serverless

Selection MUST be justified in ADR.

-------------------------------------------------
Boundary Definition
-------------------------------------------------

Boundaries MUST be defined using:

- Bounded contexts
- Deployment units
- Ownership domains
- Security zones

Cross-boundary access requires contracts.

-------------------------------------------------
Dependency Management
-------------------------------------------------

Rules:

- Core → Independent
- Infrastructure → Replaceable
- Interfaces → Stable
- Frameworks → Isolated

Violations require explicit ADR.

-------------------------------------------------
Communication Patterns
-------------------------------------------------

Allowed patterns:

- Sync (REST/gRPC)
- Async (Events/Queues)
- Batch
- Streaming

Mixing patterns requires justification.

-------------------------------------------------
Scalability Model
-------------------------------------------------

Define:

- Horizontal vs Vertical scaling
- State management
- Partitioning strategy
- Caching layers

Must align with KPIs.

=================================================================

## 7. Operational Process

-------------------------------------------------
Step 1 — Context Mapping
-------------------------------------------------

- Map bounded contexts to components
- Define ownership
- Identify coupling points

-------------------------------------------------
Step 2 — Style Selection
-------------------------------------------------

- Evaluate constraints
- Evaluate team maturity
- Evaluate domain complexity

Document trade-offs.

-------------------------------------------------
Step 3 — Component Decomposition
-------------------------------------------------

Define:

- Responsibilities
- Interfaces
- Dependencies
- Failure behavior

-------------------------------------------------
Step 4 — Integration Design
-------------------------------------------------

Specify:

- Protocols
- Message schemas
- Versioning strategy
- Retry policies

-------------------------------------------------
Step 5 — Resilience Engineering
-------------------------------------------------

Design for:

- Timeout
- Retry
- Circuit breaker
- Bulkhead
- Graceful degradation

-------------------------------------------------
Step 6 — Security Architecture
-------------------------------------------------

Define:

- Trust boundaries
- Authentication flows
- Authorization model
- Secret management
- Audit trails

-------------------------------------------------
Step 7 — ADR Production
-------------------------------------------------

Produce ADRs for:

1. **Mandatory topics** (see section 5.1): one ADR per applicable topic (architectural style, auth, inter-context communication, external integrations, security/compliance, folder structure, persistence, API design, product/infra decisions that affect architecture, testing strategy).

2. **Any other major decision** that arises during design (e.g. dependency violations, scaling choices, technology selection).

Each ADR MUST contain:

- Context
- Decision
- Alternatives considered
- Consequences

-------------------------------------------------
Step 8 — Fitness Function Definition
-------------------------------------------------

Define automated checks to enforce:

- Dependency rules
- Performance budgets
- Security constraints

-------------------------------------------------
Step 9 — Review & Validation
-------------------------------------------------

Simulate:

- Peak load
- Failure scenarios
- Security incidents

Revise if needed.

=================================================================

## 8. Decision Frameworks

-------------------------------------------------
Monolith vs Microservices
-------------------------------------------------

| Criterion         | Monolith | Microservices |
|-------------------|----------|---------------|
| Team size         | Small    | Large         |
| Domain maturity   | Low      | High          |
| Deployment needs  | Simple   | Complex       |
| Operational cost  | Low      | High          |

-------------------------------------------------
Sync vs Async
-------------------------------------------------

| Context           | Pattern |
|-------------------|---------|
| Strong consistency| Sync    |
| Loose coupling    | Async   |
| High latency risk | Async   |

=================================================================

## 9. Failure Modes (Anti-Patterns)

Invalid architecture includes:

- Framework-centric layering
- Shared databases across contexts
- God services
- Hidden coupling
- Undocumented decisions
- Over-engineering
- Premature distribution

=================================================================

## 10. Quality Metrics

Measure architecture health using:

- Dependency violation count
- Mean time to recovery (MTTR)
- Change lead time
- Component churn rate
- Incident frequency

Targets must be defined.

=================================================================

## 11. Validation Protocol

Before approval verify:

- [ ] Boundaries explicit
- [ ] Dependencies directional
- [ ] All mandatory ADR topics (section 5.1) covered when applicable; no applicable topic without an ADR
- [ ] ADRs complete (context, decision, alternatives, consequences each)
- [ ] Security integrated
- [ ] Scalability validated
- [ ] Failure modes documented
- [ ] Fitness functions defined

Failures require redesign.

=================================================================

## 12. Maturity Levels

Level 1 — Structural  
- Basic layering
- Minimal documentation

Level 2 — Managed  
- Defined interfaces
- ADR usage

Level 3 — Adaptive  
- Fitness functions
- Continuous evolution

Level 4 — Self-Optimizing  
- Automated enforcement
- Predictive scaling

Target: Level 3+

=================================================================

## 13. Exit Criteria

This skill is complete only when:

- All deliverables exist
- Validation protocol passed
- ADRs approved
- Independent review completed
- Artifacts versioned

No implementation may proceed before exit.
