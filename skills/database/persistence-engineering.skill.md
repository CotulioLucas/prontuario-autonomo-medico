# Skill: Persistence Engineering (Database)

=================================================================

## 1. Purpose

Design and implement data persistence mechanisms that preserve domain integrity, support business invariants, and enable long-term system evolution without structural degradation.

This skill exists to prevent database-driven design, data coupling, and irreversible schema decisions.

=================================================================

## 2. Applicability

This skill MUST be executed after:

- Domain Modeling completion
- System Architecture approval
- Application Engineering definition

And before:

- Large-scale data ingestion
- Production deployment
- Public API stabilization

=================================================================

## 3. Mandatory Inputs

Required artifacts:

- docs/domain/entities.md
- docs/domain/value-objects.md
- docs/domain/aggregates.md
- docs/domain/domain-rules.md
- docs/architecture/components.md
- docs/architecture/integration-patterns.md

Incomplete inputs invalidate persistence design.

=================================================================

## 4. Core Responsibilities

The executing agent SHALL:

1. Translate domain models into persistence models
2. Preserve aggregate boundaries in storage
3. Enforce referential integrity
4. Design schema evolution strategy
5. Optimize for business access patterns
6. Ensure transactional consistency
7. Protect sensitive data
8. Support auditing and traceability
9. Enable backup and recovery
10. Prevent cross-context data coupling

=================================================================

## 5. Required Deliverables

The following artifacts MUST be produced:

docs/database/
├── logical-model.md
├── physical-model.md
├── schema.sql / schema.md
├── indexes.md
├── migration-strategy.md
├── data-retention.md
└── backup-recovery.md


Missing artifacts block implementation.

=================================================================

## 6. Persistence Design Framework

-------------------------------------------------
Domain-to-Storage Mapping
-------------------------------------------------

Rules:

- One aggregate root → one transactional boundary
- Internal aggregate objects → embedded or linked
- Cross-aggregate references → indirect identifiers

No foreign keys across bounded contexts.

-------------------------------------------------
Normalization vs Denormalization
-------------------------------------------------

Normalize when:

- Data consistency is critical
- Update frequency is high

Denormalize when:

- Read performance dominates
- Data is eventually consistent

Document trade-offs.

-------------------------------------------------
Identity Management
-------------------------------------------------

All persisted entities MUST have:

- Stable identifiers
- Generation strategy
- Collision prevention

No business logic in IDs.

-------------------------------------------------
Indexing Strategy
-------------------------------------------------

Indexes MUST be derived from:

- Query patterns
- SLA requirements
- Hot paths

No speculative indexing.

-------------------------------------------------
Schema Evolution
-------------------------------------------------

All changes MUST be:

- Versioned
- Backward compatible
- Reversible

Breaking changes require migration plans.

-------------------------------------------------
Sensitive Data Handling
-------------------------------------------------

Define:

- Encryption at rest
- Masking rules
- Access controls
- Retention periods

PII must be isolated.

=================================================================

## 7. Operational Process

-------------------------------------------------
Step 1 — Access Pattern Analysis
-------------------------------------------------

Map:

- Critical queries
- Write frequencies
- Aggregation needs

Derive schema from usage.

-------------------------------------------------
Step 2 — Logical Model Design
-------------------------------------------------

Design:

- Tables/collections
- Relationships
- Constraints

Reflect domain structure.

-------------------------------------------------
Step 3 — Physical Optimization
-------------------------------------------------

Define:

- Storage engines
- Partitioning
- Sharding (if needed)
- Replication

Align with scale targets.

-------------------------------------------------
Step 4 — Migration Planning
-------------------------------------------------

For each change:

- Forward script
- Rollback script
- Data validation

Automate execution.

-------------------------------------------------
Step 5 — Integrity Enforcement
-------------------------------------------------

Apply:

- Constraints
- Triggers (sparingly)
- Application-level checks

Never rely on app only.

-------------------------------------------------
Step 6 — Audit & Compliance Design
-------------------------------------------------

Implement:

- Change history
- Access logs
- Retention enforcement

-------------------------------------------------
Step 7 — Backup & Recovery Testing
-------------------------------------------------

Simulate:

- Partial loss
- Full loss
- Corruption

Restore must be verified.

-------------------------------------------------
Step 8 — Performance Validation
-------------------------------------------------

Benchmark:

- Peak load
- Worst-case queries
- Concurrent writes

Refine accordingly.

=================================================================

## 8. Decision Frameworks

-------------------------------------------------
Relational vs NoSQL
-------------------------------------------------

| Criterion        | Relational | NoSQL |
|------------------|------------|-------|
| Strong integrity | High       | Low   |
| Schema stability | Medium     | Low   |
| Scale-out needs  | Medium     | High  |

-------------------------------------------------
Embedded vs Referenced
-------------------------------------------------

| Context              | Strategy   |
|----------------------|------------|
| Same aggregate       | Embedded   |
| Cross aggregate      | Reference  |
| Cross context        | ID only    |

=================================================================

## 9. Failure Modes (Anti-Patterns)

Invalid persistence includes:

- Shared databases across contexts
- Anemic tables
- Over-normalization
- Hardcoded queries
- Missing migrations
- Manual schema changes
- Unencrypted sensitive data

=================================================================

## 10. Quality Metrics

Track:

- Query response time
- Index hit ratio
- Migration failure rate
- Data inconsistency incidents
- Recovery time objective (RTO)

Targets defined per system.

=================================================================

## 11. Validation Protocol

Before approval verify:

- [ ] Aggregate boundaries preserved
- [ ] Referential integrity enforced
- [ ] Migrations automated
- [ ] Sensitive data protected
- [ ] Backup tested
- [ ] Performance benchmarked
- [ ] Cross-context coupling avoided

Failures require redesign.

=================================================================

## 12. Maturity Levels

Level 1 — Basic  
- CRUD schemas
- Manual migrations

Level 2 — Managed  
- Versioned schemas
- Indexed queries

Level 3 — Resilient  
- Automated recovery
- Performance tuned

Level 4 — Adaptive  
- Online migrations
- Predictive scaling

Target: Level 3+

=================================================================

## 13. Exit Criteria

This skill is complete only when:

- All deliverables exist
- Validation protocol passed
- Recovery tested
- Security review approved
- Artifacts versioned

No production data allowed before exit.
