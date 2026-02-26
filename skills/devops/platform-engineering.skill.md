# Skill: Platform Engineering & DevOps

=================================================================

## 1. Purpose

Design, implement, and operate a resilient, secure, and automated delivery and infrastructure platform that ensures reliable system operation throughout its lifecycle.

This skill exists to eliminate manual deployment risk, configuration drift, and operational fragility.

=================================================================

## 2. Applicability

This skill MUST be executed:

- During infrastructure design
- During CI/CD pipeline creation
- During environment provisioning
- During scaling initiatives
- During incident recovery

Operations are engineered, not improvised.

=================================================================

## 3. Mandatory Inputs

Required artifacts:

- docs/architecture/deployment-view.md
- docs/architecture/components.md
- docs/architecture/failure-modes.md
- docs/05-security/secrets-management.md
- docs/05-security/incident-response.md
- docs/06-devops/environments.md (if exists)

Missing inputs invalidate platform work.

=================================================================

## 4. Core Responsibilities

The executing agent SHALL:

1. Design CI/CD pipelines
2. Implement infrastructure as code
3. Standardize environments
4. Automate deployments
5. Manage configuration
6. Ensure observability
7. Enable self-healing mechanisms
8. Enforce operational security
9. Optimize resource usage
10. Support disaster recovery

=================================================================

## 5. Required Deliverables

The following artifacts MUST be produced:

infra/
├── iac/
├── environments/
├── pipelines/
├── monitoring/
├── alerting/
├── runbooks/
└── disaster-recovery/


Absence blocks production readiness.

=================================================================

## 6. Platform Engineering Framework

-------------------------------------------------
Infrastructure as Code
-------------------------------------------------

All infrastructure MUST be:

- Version-controlled
- Reproducible
- Reviewable
- Testable

Manual changes are forbidden.

-------------------------------------------------
Environment Standardization
-------------------------------------------------

All environments MUST be:

- Built from same templates
- Configured via parameters
- Isolated
- Auditable

Snowflake environments are prohibited.

-------------------------------------------------
CI/CD Pipeline Architecture
-------------------------------------------------

Pipelines MUST include:

- Build
- Test
- Security scan
- Compliance checks
- Artifact signing
- Deployment gates

No bypass allowed.

-------------------------------------------------
Deployment Strategies
-------------------------------------------------

Approved patterns:

- Blue/Green
- Canary
- Rolling
- Feature flags

Big-bang deployments forbidden.

-------------------------------------------------
Configuration Management
-------------------------------------------------

Configs MUST be:

- Externalized
- Versioned
- Encrypted
- Validated

No hardcoded config.

-------------------------------------------------
Observability Stack
-------------------------------------------------

Implement:

- Centralized logging
- Distributed tracing
- Metrics collection
- Health checks

Monitoring without alerting is incomplete.

-------------------------------------------------
Resilience Engineering
-------------------------------------------------

Systems MUST support:

- Auto-scaling
- Auto-restart
- Circuit breakers
- Graceful degradation

-------------------------------------------------
Disaster Recovery
-------------------------------------------------

Define:

- RPO
- RTO
- Backup schedules
- Restore drills

Recovery must be tested.

=================================================================

## 7. Operational Process

-------------------------------------------------
Step 1 — Pipeline Design
-------------------------------------------------

Define:

- Stage sequence
- Approval gates
- Rollback triggers

-------------------------------------------------
Step 2 — IaC Development
-------------------------------------------------

Implement:

- Provisioning
- Networking
- Security policies

-------------------------------------------------
Step 3 — Environment Provisioning
-------------------------------------------------

Create:

- Dev
- Test
- Staging
- Production

From same baseline.

-------------------------------------------------
Step 4 — Observability Integration
-------------------------------------------------

Deploy:

- Log collectors
- Tracers
- Metrics agents

-------------------------------------------------
Step 5 — Release Management
-------------------------------------------------

Coordinate:

- Versioning
- Change logs
- Rollout plans

-------------------------------------------------
Step 6 — Incident Management
-------------------------------------------------

Execute:

- Triage
- Mitigation
- Postmortem

-------------------------------------------------
Step 7 — Capacity Planning
-------------------------------------------------

Forecast:

- Growth
- Cost
- Bottlenecks

-------------------------------------------------
Step 8 — Continuous Optimization
-------------------------------------------------

Refine:

- Pipelines
- Costs
- Reliability

=================================================================

## 8. Decision Frameworks

-------------------------------------------------
Managed vs Self-Hosted
-------------------------------------------------

| Criterion       | Managed | Self-Hosted |
|-----------------|---------|-------------|
| Ops effort      | Low     | High        |
| Control         | Medium  | High        |
| Cost at scale   | Medium  | Variable    |

-------------------------------------------------
Push vs Pull Deploy
-------------------------------------------------

| Context        | Preferred |
|----------------|-----------|
| Regulated env  | Pull      |
| Cloud-native   | Push      |

=================================================================

## 9. Failure Modes (Anti-Patterns)

Invalid DevOps practices include:

- Manual production changes
- Environment drift
- Untested rollbacks
- Missing monitoring
- Silent failures
- Hardcoded secrets

=================================================================

## 10. Quality Metrics

Track:

- Deployment frequency
- Change failure rate
- Mean time to recovery (MTTR)
- Infrastructure drift incidents
- Cost efficiency

Targets aligned with SLOs.

=================================================================

## 11. Validation Protocol

Before approval verify:

- [ ] IaC reviewed
- [ ] Pipelines tested
- [ ] Rollbacks verified
- [ ] Monitoring active
- [ ] Alerts tested
- [ ] DR drills executed
- [ ] Security scans passing

Failures block production.

=================================================================

## 12. Maturity Levels

Level 1 — Manual  
- Script-based deploys

Level 2 — Automated  
- CI/CD active

Level 3 — Reliable  
- Self-healing systems

Level 4 — Autonomous  
- Predictive operations

Target: Level 3+

=================================================================

## 13. Exit Criteria

This skill is complete only when:

- All deliverables exist
- Validation protocol passed
- SLOs defined
- Incident response tested
- Governance approval obtained

No production system without exit compliance.
