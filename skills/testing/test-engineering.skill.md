# Skill: Test Engineering & Quality Assurance

=================================================================

## 1. Purpose

Design, implement, and operate a comprehensive testing system that continuously verifies business correctness, architectural compliance, security guarantees, and operational reliability.

This skill exists to prevent undetected regressions, hidden coupling, and unvalidated assumptions.

=================================================================

## 2. Applicability

This skill MUST be executed:

- During application development
- During infrastructure changes
- During security updates
- Before any deployment
- After major refactoring

Testing is continuous, not episodic.

=================================================================

## 3. Mandatory Inputs

Required artifacts:

- docs/domain/domain-rules.md
- docs/domain/aggregates.md
- docs/03-requirements/acceptance-criteria.md
- docs/architecture/style.md
- docs/05-security/threat-model.md
- docs/05-security/data-protection.md

Missing inputs invalidate test design.

=================================================================

## 4. Core Responsibilities

The executing agent SHALL:

1. Define testing strategy
2. Implement automated tests
3. Validate business invariants
4. Verify architectural constraints
5. Test security controls
6. Detect performance regressions
7. Validate data integrity
8. Ensure environment parity
9. Maintain test reliability
10. Produce actionable reports

=================================================================

## 5. Required Deliverables

The following artifacts MUST be produced:

tests/
├── unit/
├── integration/
├── contract/
├── security/
├── performance/
├── e2e/
├── fixtures/
└── test-strategy.md


Absence blocks deployment.

=================================================================

## 6. Testing Architecture Framework

-------------------------------------------------
Test Pyramid
-------------------------------------------------

Distribution target:

- Unit tests: ~60–70%
- Integration tests: ~20–30%
- E2E tests: ~5–10%
- Manual tests: minimal

-------------------------------------------------
Test Classification
-------------------------------------------------

| Type        | Purpose                         |
|-------------|---------------------------------|
| Unit        | Verify isolated logic            |
| Integration | Verify component interaction     |
| Contract    | Verify external interfaces       |
| Security    | Verify threat mitigation         |
| Performance | Verify SLA compliance            |
| E2E         | Verify business flows            |

-------------------------------------------------
Environment Strategy
-------------------------------------------------

Environments MUST include:

- Local
- CI
- Staging
- Production (read-only validation)

Config drift is forbidden.

-------------------------------------------------
Data Management
-------------------------------------------------

Test data MUST be:

- Deterministic
- Reproducible
- Isolated
- Resettable

No shared mutable state.

-------------------------------------------------
Observability in Tests
-------------------------------------------------

Tests MUST capture:

- Logs
- Metrics
- Traces (where applicable)

Failures without diagnostics are invalid.

=================================================================

## 7. Operational Process

-------------------------------------------------
Step 1 — Requirement Traceability
-------------------------------------------------

Map each:

- Business rule
- Invariant
- KPI
- Risk

To at least one automated test.

-------------------------------------------------
Step 2 — Test Design
-------------------------------------------------

Define:

- Inputs
- Expected outcomes
- Failure conditions
- Edge cases

Cover normal and abnormal flows.

-------------------------------------------------
Step 3 — Automation Implementation
-------------------------------------------------

Prefer:

- Deterministic tests
- Explicit setup
- Explicit teardown

Avoid hidden dependencies.

-------------------------------------------------
Step 4 — Contract Validation
-------------------------------------------------

Validate:

- API schemas
- Event formats
- Version compatibility

Breaking changes must fail.

-------------------------------------------------
Step 5 — Security Testing
-------------------------------------------------

Execute:

- Input fuzzing
- Auth bypass attempts
- Rate limit testing
- Injection tests

-------------------------------------------------
Step 6 — Performance Testing
-------------------------------------------------

Simulate:

- Peak traffic
- Burst loads
- Resource exhaustion

Validate SLA adherence.

-------------------------------------------------
Step 7 — Failure Injection
-------------------------------------------------

Inject:

- Network latency
- Service outages
- Data corruption
- Dependency failure

Validate resilience.

-------------------------------------------------
Step 8 — Flakiness Management
-------------------------------------------------

Track:

- Intermittent failures
- Timing issues
- Environmental drift

Unstable tests must be fixed or removed.

-------------------------------------------------
Step 9 — Reporting & Feedback
-------------------------------------------------

Generate:

- Coverage reports
- Risk exposure reports
- Regression summaries

Feed into planning.

=================================================================

## 8. Decision Frameworks

-------------------------------------------------
Mock vs Real Dependency
-------------------------------------------------

| Context              | Preferred |
|----------------------|-----------|
| Pure domain logic    | Mock      |
| Persistence          | Real      |
| External APIs        | Contract  |
| Security boundaries  | Real      |

-------------------------------------------------
Test Isolation Level
-------------------------------------------------

| Scope        | Isolation |
|--------------|-----------|
| Unit         | High      |
| Integration  | Medium    |
| E2E          | Low       |

=================================================================

## 9. Failure Modes (Anti-Patterns)

Invalid testing practices include:

- Testing implementation details
- Excessive E2E dependence
- Hardcoded test data
- Environment-specific tests
- Ignored flaky tests
- Manual-only validation

=================================================================

## 10. Quality Metrics

Track:

- Code coverage (logic-focused)
- Test pass rate
- Flakiness rate
- Mean time to detect regressions
- Defect escape rate

Targets defined by risk profile.

=================================================================

## 11. Validation Protocol

Before approval verify:

- [ ] All invariants covered
- [ ] Contracts validated
- [ ] Security tests executed
- [ ] Performance benchmarks met
- [ ] No flaky tests
- [ ] Reports generated
- [ ] CI integrated

Failures block deployment.

=================================================================

## 12. Maturity Levels

Level 1 — Reactive  
- Manual testing
- Low automation

Level 2 — Automated  
- CI integration
- Basic coverage

Level 3 — Preventive  
- Risk-based testing
- Failure injection

Level 4 — Predictive  
- ML-based anomaly detection
- Continuous optimization

Target: Level 3+

=================================================================

## 13. Exit Criteria

This skill is complete only when:

- All deliverables exist
- Validation protocol passed
- Coverage targets met
- CI gates enforced
- Independent review completed

No production release allowed before exit.
