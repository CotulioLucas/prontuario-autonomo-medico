# Skill: Business Analysis

=================================================================

## 1. Purpose

Systematically identify, validate, and document business problems, strategic objectives, constraints, and success metrics before any technical or architectural decision is made.

This skill exists to minimize strategic risk and prevent solution-first thinking.

=================================================================

## 2. Applicability

This skill MUST be executed when:

- Initiating a new project
- Launching a new product
- Performing major refactoring
- Redefining system scope
- Entering a new market

No source code may be created before completion.

=================================================================

## 3. Mandatory Inputs

All analyses must be grounded in verifiable information.

Required sources:

- Stakeholder interviews
- Business strategy documents
- Market research (if available)
- Historical performance data
- User feedback
- Regulatory documentation (if applicable)

Assumptions without evidence must be explicitly labeled.

=================================================================

## 4. Core Responsibilities

The executing agent SHALL:

1. Identify the primary business problem
2. Define measurable strategic objectives
3. Map direct and indirect stakeholders
4. Identify operational, legal, and financial constraints
5. Analyze economic viability
6. Identify systemic business risks
7. Define success metrics
8. Register assumptions and uncertainties
9. Establish validation checkpoints

=================================================================

## 5. Required Deliverables

The following artifacts MUST be produced:

docs/content/
├── business-problem.md
├── strategic-objectives.md
├── stakeholders.md
├── constraints.md
├── risks.md
├── kpis.md
└── assumptions.md


Absence of any artifact blocks progression.

=================================================================

## 6. Operational Process

-------------------------------------------------
Step 1 — Problem Decomposition
-------------------------------------------------

Formally document:

- Current state
- Desired future state
- Business impact
- Cost of inaction
- Root causes

Avoid technical terminology.

-------------------------------------------------
Step 2 — Stakeholder System Mapping
-------------------------------------------------

Classify stakeholders by:

- Authority
- Interest
- Influence
- Dependency

Document conflicts and alignment risks.

-------------------------------------------------
Step 3 — Objective Formalization
-------------------------------------------------

Each objective MUST contain:

- Target metric
- Baseline
- Target value
- Time horizon
- Measurement method

Example:

"Reduce customer churn from 12% to 7% within 9 months, measured via CRM retention reports."

-------------------------------------------------
Step 4 — Constraint Modeling
-------------------------------------------------

Model constraints across:

- Budget
- Timeline
- Compliance
- Infrastructure
- Organizational capacity
- Vendor dependencies

Constraints must be quantified when possible.

-------------------------------------------------
Step 5 — Risk Engineering
-------------------------------------------------

Each risk MUST include:

| Field        | Description                |
|--------------|----------------------------|
| Description  | Risk statement             |
| Probability  | Low / Medium / High         |
| Impact       | Low / Medium / High         |
| Mitigation   | Preventive action          |
| Owner        | Responsible stakeholder    |

Unowned risks are invalid.

-------------------------------------------------
Step 6 — KPI Architecture
-------------------------------------------------

For each KPI define:

- Data source
- Update frequency
- Responsible owner
- Alert thresholds

KPIs without monitoring are non-compliant.

-------------------------------------------------
Step 7 — Assumption Governance
-------------------------------------------------

For each assumption:

- Evidence level
- Validation plan
- Review deadline
- Impact if invalidated

High-impact assumptions must be prioritized.

=================================================================

## 7. Decision Frameworks

-------------------------------------------------
Build vs Buy vs Partner
-------------------------------------------------

| Criterion          | Build | Buy | Partner |
|--------------------|-------|-----|---------|
| Strategic control  | High  | Low | Medium  |
| Time to market     | Low   | High| Medium  |
| Differentiation    | High  | Low | Medium  |
| Operational risk   | Medium| Low | Medium  |

-------------------------------------------------
Speed vs Robustness
-------------------------------------------------

| Context             | Strategy             |
|---------------------|----------------------|
| Market uncertainty | Controlled MVP        |
| Stable domain       | Robust architecture   |
| Regulatory pressure| Compliance-first      |

=================================================================

## 8. Failure Modes (Anti-Patterns)

The following invalidate the analysis:

- Technology-driven problem framing
- Undefined success metrics
- Implicit assumptions
- Unvalidated stakeholder alignment
- Unquantified constraints
- Informal risk handling

=================================================================

## 9. Quality Metrics

Evaluate analysis maturity using:

- Percentage of validated assumptions
- Number of undocumented risks
- KPI coverage ratio
- Stakeholder alignment score
- Constraint quantification rate

Target: Continuous improvement.

=================================================================

## 10. Validation Protocol

Before completion, verify:

- [ ] Problem statement approved
- [ ] Objectives quantified
- [ ] Stakeholders validated
- [ ] Constraints documented
- [ ] Risks owned
- [ ] KPIs operational
- [ ] Assumptions governed

Any failed item requires re-execution.

=================================================================

## 11. Maturity Levels

Level 1 — Reactive  
- Informal analysis
- High uncertainty

Level 2 — Structured  
- Documented risks
- Defined KPIs

Level 3 — Data-Driven  
- Historical benchmarking
- Continuous validation

Level 4 — Predictive  
- Scenario modeling
- Real-time indicators

Target: Level 3+

=================================================================

## 12. Exit Criteria

This skill is complete only when:

- All deliverables exist
- Validation protocol passed
- Independent review completed
- Artifacts versioned

No technical work may proceed before exit criteria are met.
