# Skill: Secure System Engineering

=================================================================

## 1. Purpose

Design, implement, and continuously validate security mechanisms that protect system assets, user data, and operational integrity against internal and external threats.

This skill exists to enforce security by design rather than security by remediation.

=================================================================

## 2. Applicability

This skill MUST be executed:

- During architecture design
- During application implementation
- During infrastructure provisioning
- Before any production deployment
- After any major system change

Security is continuous, not a phase.

=================================================================

## 3. Mandatory Inputs

Required artifacts:

- docs/architecture/overview.md
- docs/architecture/integration-patterns.md
- docs/architecture/failure-modes.md
- docs/content/constraints.md
- docs/domain/domain-rules.md
- docs/database/data-retention.md

Incomplete inputs invalidate security work.

=================================================================

## 4. Core Responsibilities

The executing agent SHALL:

1. Perform structured threat modeling
2. Define trust boundaries
3. Design authentication mechanisms
4. Design authorization models
5. Protect sensitive data
6. Secure inter-service communication
7. Implement secrets management
8. Enforce auditability
9. Validate compliance requirements
10. Establish incident response procedures

=================================================================

## 5. Required Deliverables

The following artifacts MUST be produced:

docs/05-security/
├── threat-model.md
├── trust-boundaries.md
├── auth-model.md
├── data-protection.md
├── secrets-management.md
├── audit-logging.md
├── compliance.md
└── incident-response.md


Absence blocks deployment.

=================================================================

## 6. Security Engineering Framework

-------------------------------------------------
Threat Modeling
-------------------------------------------------

Apply STRIDE methodology:

- Spoofing
- Tampering
- Repudiation
- Information Disclosure
- Denial of Service
- Elevation of Privilege

Map threats per component.

-------------------------------------------------
Trust Boundary Design
-------------------------------------------------

Each boundary MUST define:

- Entry points
- Authentication requirements
- Validation rules
- Monitoring controls

Implicit trust is forbidden.

-------------------------------------------------
Authentication Architecture
-------------------------------------------------

Define:

- Identity providers
- Token formats
- Session management
- Rotation policies

Prefer standardized protocols.

-------------------------------------------------
Authorization Model
-------------------------------------------------

Select and document:

- RBAC
- ABAC
- Policy-based
- Hybrid

Permissions must be explicit.

-------------------------------------------------
Data Protection
-------------------------------------------------

Implement:

- Encryption at rest
- Encryption in transit
- Key management
- Data minimization

No plaintext sensitive storage.

-------------------------------------------------
Secrets Management
-------------------------------------------------

Rules:

- No secrets in code
- Centralized vault
- Rotation automation
- Access logging

-------------------------------------------------
Secure Communication
-------------------------------------------------

All inter-component communication MUST:

- Use mutual authentication
- Enforce TLS
- Validate certificates
- Apply rate limiting

-------------------------------------------------
Audit & Logging
-------------------------------------------------

Logs MUST be:

- Tamper-resistant
- Centralized
- Retained per policy
- Privacy-compliant

-------------------------------------------------
Compliance Engineering
-------------------------------------------------

Map system controls to:

- GDPR/LGPD
- PCI-DSS
- ISO 27001
- SOC2 (if applicable)

Document gaps.

=================================================================

-------------------------------------------------
Data Exposure Governance
-------------------------------------------------

All system components MUST enforce strict data visibility policies.

Sensitive data MUST NOT be exposed via:

- Client-side network responses
- Browser developer tools
- Application logs
- Error messages
- Debug endpoints
- Monitoring exports

Exposure control MUST be centralized.

-------------------------------------------------
BFF / Gateway Enforcement
-------------------------------------------------

All client-facing communication SHOULD be mediated by a BFF or API Gateway layer.

This layer MUST:

- Sanitize payloads
- Remove sensitive fields
- Enforce contextual authorization
- Apply data minimization
- Transform internal models into public contracts

Direct client access to core domain APIs is forbidden unless explicitly approved.

All internal domain models MUST be mapped to explicit public DTOs.
Automatic serialization of domain objects is forbidden.

-------------------------------------------------
Payload Classification
-------------------------------------------------

All data fields MUST be classified as:

| Level | Description              |
|-------|--------------------------|
| P0    | Public                   |
| P1    | Internal                  |
| P2    | Confidential              |
| P3    | Highly Sensitive (PII)    |

Classification MUST be documented.

-------------------------------------------------
Logging & Telemetry Sanitization
-------------------------------------------------

All logs and metrics MUST:

- Mask sensitive fields
- Remove credentials
- Avoid payload dumping
- Enforce redaction rules

Raw payload logging is prohibited.

-------------------------------------------------
Error & Exception Hardening
-------------------------------------------------

Errors MUST:

- Avoid stack trace exposure
- Avoid internal identifiers
- Avoid infrastructure details
- Use standardized public error formats

Internal diagnostics MUST be isolated.

-------------------------------------------------
Frontend Data Handling Controls
-------------------------------------------------

Client applications MUST:

- Store only minimum required data
- Avoid persistent sensitive storage
- Prevent verbose debugging in production
- Clear sensitive state on logout

-------------------------------------------------
Security Validation for Exposure
-------------------------------------------------

Regular audits MUST include:

- DevTools inspection
- Traffic interception tests
- Log inspection
- Error path analysis


## 7. Operational Process

-------------------------------------------------
Step 1 — Asset Identification
-------------------------------------------------

Identify:

- Data assets
- Service assets
- Credential assets
- Infrastructure assets

Rank by criticality.

-------------------------------------------------
Step 2 — Attack Surface Mapping
-------------------------------------------------

Document:

- Public endpoints
- Internal APIs
- Admin interfaces
- Third-party integrations

-------------------------------------------------
Step 3 — Threat Enumeration
-------------------------------------------------

Apply STRIDE per asset.

-------------------------------------------------
Step 4 — Control Design
-------------------------------------------------

Define preventive, detective, and corrective controls.

-------------------------------------------------
Step 5 — Security Validation
-------------------------------------------------

Execute:

- Static analysis
- Dependency scanning
- Pen testing (where possible)
- Configuration audits

-------------------------------------------------
Step 6 — Incident Response Planning
-------------------------------------------------

Define:

- Detection triggers
- Escalation paths
- Containment actions
- Recovery procedures

-------------------------------------------------
Step 7 — Continuous Monitoring
-------------------------------------------------

Implement:

- Intrusion detection
- Anomaly detection
- Alert correlation

-------------------------------------------------
Step 8 — Periodic Review
-------------------------------------------------

Reassess quarterly or after major change.

=================================================================

## 8. Decision Frameworks

-------------------------------------------------
Centralized vs Federated Identity
-------------------------------------------------

| Criterion        | Centralized | Federated |
|------------------|-------------|-----------|
| Control          | High        | Medium    |
| Integration cost | Low         | Medium    |
| Vendor lock-in   | Medium      | Low       |

-------------------------------------------------
Token vs Session
-------------------------------------------------

| Context           | Preferred |
|-------------------|-----------|
| APIs              | Token     |
| Web apps          | Session   |
| Distributed flows | Token     |

=================================================================

## 9. Failure Modes (Anti-Patterns)

Invalid security practices include:

- Hardcoded credentials
- Implicit trust zones
- Excessive privileges
- Unencrypted backups
- Missing audit trails
- Shared accounts
- Untested recovery plans

=================================================================

## 10. Quality Metrics

Monitor:

- Vulnerability remediation time
- Unauthorized access attempts
- Incident frequency
- Patch latency
- Compliance gaps

Targets defined by risk profile.

=================================================================

## 11. Validation Protocol

Before approval verify:

- [ ] Threat model complete
- [ ] Trust boundaries defined
- [ ] Auth model tested
- [ ] Secrets secured
- [ ] Encryption enforced
- [ ] Logs centralized
- [ ] Incident plan tested

Failures block deployment.

=================================================================

## 12. Maturity Levels

Level 1 — Reactive  
- Basic controls
- Manual response

Level 2 — Managed  
- Documented policies
- Regular audits

Level 3 — Proactive  
- Continuous monitoring
- Automated remediation

Level 4 — Adaptive  
- Threat intelligence
- Predictive defense

Target: Level 3+

=================================================================

## 13. Exit Criteria

This skill is complete only when:

- All deliverables exist
- Validation protocol passed
- Penetration testing executed (if applicable)
- Compliance reviewed
- Security sign-off obtained

No production deployment allowed before exit.
