# EHRCMS Medical Officer of Health (MOH) — End-to-End UX Flow Map

## Scope

This document maps how the **Medical Officer of Health (MOH) / Director** moves across the officer console to complete their work.

The SRS assigns the MOH responsibility to:

- Approve facilities and licensed providers
- Decide Fitness, Fumigation, and Health Approval cases
- Sign and issue certificates
- Schedule Health Approval inspections
- Suspend, revoke, or withdraw certificates where authorised
- Review inspection findings and certificate-risk cases
- Override certificate expiry only with a written reason
- Review objections/appeals where the final process is later confirmed
- Use approval queues, Health Approval eligibility lists, and reporting

## Important Note

There is currently **no separate MOH screen-specification document**.

The screens below are therefore a **lean UX interpretation of the SRS requirements**. They do not add new business rules. Where the SRS is unclear or internally inconsistent, the gap is called out instead of being silently resolved.

---

# 1. Core MOH Navigation

**Sign In → MOH Home / Decision Queue**

From the home screen, the MOH can move into:

- **Fitness Queue → Fitness Case Review → Decision → Issue / Refuse**
- **Fumigation Queue → Fumigation Case Review → Decision → Issue / Refuse**
- **Health Approval Eligibility → Schedule Inspection → Completed Inspection Review → Approve / Refuse / Approve with Conditions**
- **Certificate Actions → Suspension / Revocation / Withdrawal Decision**
- **Facility & Provider Approvals → Partner Review → Approve / Refuse**
- **Reports → Council-level reporting**

---

# 2. Authentication and Home

## 01. Sign In

**Purpose:** Authenticate the MOH before access to decision-making and certificate controls.

| Clickable item | Destination | What happens there |
|---|---|---|
| `Sign in` | **02. MOH Home / Decision Queue** | The MOH enters the officer console for their permitted council. |
| `Forgot password` | **Password recovery flow** | Starts account recovery. |

### Required security behaviour

Issuing, suspending, revoking, and withdrawing require the MOH/Director to **re-enter their password at the point of action**.

Users with these powers must also use **two-factor sign-in**.

---

## 02. MOH Home / Decision Queue

**Purpose:** Show decisions and approvals currently waiting for MOH action.

| Clickable item | Destination | What happens there |
|---|---|---|
| `Fitness applications` | **03. Fitness Decision Queue** | Shows Fitness applications ready for MOH review. |
| `Fumigation applications` | **06. Fumigation Decision Queue** | Shows Fumigation applications ready for MOH review. |
| `Health Approval` | **09. Health Approval Worklist** | Shows eligible premises, inspections in progress, and decisions awaiting review. |
| `Certificate actions` | **14. Certificate Action Queue** | Shows certificates requiring suspension, revocation, or withdrawal decisions. |
| `Facilities & providers` | **17. Partner Approval Queue** | Shows facility/provider approval requests requiring MOH action. |
| `Reports` | **20. Reports** | Opens reporting available to the MOH. |
| Alert / task card | **Relevant case detail screen** | Opens the case requiring immediate MOH attention. |

> **Lean recommendation:** Keep this page queue-based. The MOH's main job in the system is to make authorised decisions, not manage operational work.

---

# 3. Fitness Certificate Decision Flow

## 03. Fitness Decision Queue

**Purpose:** Show Fitness applications whose assessment results are ready for MOH review.

| Clickable item | Destination | What happens there |
|---|---|---|
| Application row | **04. Fitness Case Review** | Opens the selected Fitness application, staff results, facility information, and supporting records. |
| `Filter` | **Same screen** | Filters cases by status, date, premises, or facility. |
| `Back` | **02. MOH Home / Decision Queue** | Returns to the MOH home screen. |

---

## 04. Fitness Case Review

**Purpose:** Let the MOH review the application and person-level assessment results before making a decision.

**Key information shown:**

- Applicant and premises
- Selected approved facility
- Payment/service status
- Food handlers on the application
- Person-level result: `Fit`, `Not Fit`, or `Refer`
- Medical/laboratory detail visible only where authorised
- Supporting documents
- Application history

| Clickable item | Destination | What happens there |
|---|---|---|
| Food handler row | **Person assessment detail** | Shows the authorised assessment detail for that individual. |
| Supporting document | **Document detail** | Opens the supporting document and its verification information. |
| Facility | **Partner detail** | Shows the approved facility connected to the case. |
| `Remove referred person` | **Same screen / confirmation** | Where allowed, removes a person still marked `Refer` from this certificate decision and requires a reason. |
| `Make decision` | **05. Fitness Decision & Issue** | Opens the decision step once the application can legally be decided. |
| `Back` | **03. Fitness Decision Queue** | Returns to the queue without making a decision. |

### Blocked state

The MOH cannot issue while any person remains marked `Refer`, unless that person is removed from the certificate with a recorded reason.

---

## 05. Fitness Decision & Issue

**Purpose:** Record the MOH's decision and, where approved, issue the Fitness Certificate.

| Clickable item | Destination | What happens there |
|---|---|---|
| `Approve and issue` | **Password re-entry → Issued Fitness Certificate** | After authorisation, the system issues and locks the certificate. |
| `Refuse` | **Decision confirmation** | Records the refusal and reason and informs the applicant. |
| `Override expiry` | **Same screen — reason required** | Allows only the MOH to override the calculated expiry with a written reason. |
| `Cancel` | **04. Fitness Case Review** | Returns to the case without recording a decision. |

### After issuance

The issued certificate is locked.

A later correction requires the old certificate to be cancelled and a replacement issued; the original is never edited.

---

# 4. Fumigation Certificate Decision Flow

## 06. Fumigation Decision Queue

**Purpose:** Show fumigation applications ready for MOH review after provider work and EHO confirmation/dispute.

| Clickable item | Destination | What happens there |
|---|---|---|
| Application row | **07. Fumigation Case Review** | Opens the provider report, EHO supervision/confirmation, premises, and case history. |
| `Filter` | **Same screen** | Filters cases by status, provider, date, or premises. |
| `Back` | **02. MOH Home / Decision Queue** | Returns to the main MOH queue. |

---

## 07. Fumigation Case Review

**Purpose:** Let the MOH review the completed fumigation work before deciding the certificate.

**Key information shown:**

- Premises
- Licensed provider
- Provider registration number
- Work date
- Areas treated
- Pests targeted
- Chemicals/methods used
- Supervising EHO
- EHO confirmation or dispute
- Provider job report
- Payment/service status
- Supporting documents/history

| Clickable item | Destination | What happens there |
|---|---|---|
| `View provider report` | **Provider report detail** | Shows the submitted fumigation job report. |
| `View EHO confirmation` | **EHO supervision detail** | Shows whether the supervising EHO confirmed or disputed the report. |
| `View premises` | **Premises compliance view** | Opens the premises' wider certificate and inspection history. |
| `Make decision` | **08. Fumigation Decision & Issue** | Opens the MOH decision step. |
| `Back` | **06. Fumigation Decision Queue** | Returns to the fumigation queue. |

---

## 08. Fumigation Decision & Issue

**Purpose:** Record the MOH's decision and, where approved, issue the Fumigation Certificate.

| Clickable item | Destination | What happens there |
|---|---|---|
| `Approve and issue` | **Password re-entry → Issued Fumigation Certificate** | Issues and locks the Fumigation Certificate after authorisation. |
| `Refuse` | **Decision confirmation** | Records the refusal and written reason. |
| `Override expiry` | **Same screen — reason required** | Allows the MOH to change the calculated expiry with a written reason. |
| `Cancel` | **07. Fumigation Case Review** | Returns without making a decision. |

---

# 5. Health Approval Flow

## 09. Health Approval Worklist

**Purpose:** Show premises that have become eligible for Health Approval and cases moving through inspection.

The system adds a premises to this worklist when:

- Required Fitness Certificates are valid
- The Fumigation Certificate is valid
- Any additional council-configured conditions are satisfied

| Clickable item | Destination | What happens there |
|---|---|---|
| Eligible premises row | **10. Health Approval Eligibility Detail** | Shows why the premises qualifies and the state of its underlying requirements. |
| Inspection pending row | **11. Health Approval Inspection Detail** | Shows the scheduled/served inspection and its progress. |
| Decision pending row | **12. Health Approval Decision Review** | Opens the completed inspection and officer recommendation for MOH decision. |
| `Filter` | **Same screen** | Filters by eligibility, inspection stage, or decision stage. |
| `Back` | **02. MOH Home / Decision Queue** | Returns to the MOH home screen. |

---

## 10. Health Approval Eligibility Detail

**Purpose:** Confirm the premises' eligibility before the MOH schedules the required approval inspection.

**Key information shown:**

- Premises
- Current Fitness status
- Current Fumigation status
- Additional configured conditions
- Eligibility state
- Existing Health Approval, if any
- Previous inspection history

| Clickable item | Destination | What happens there |
|---|---|---|
| Fitness status | **Relevant Fitness certificate/status detail** | Shows the Fitness evidence supporting eligibility. |
| Fumigation status | **Relevant Fumigation certificate detail** | Shows the premises' valid fumigation record. |
| `View premises` | **Premises compliance view** | Opens the full compliance history for the premises. |
| `Schedule approval inspection` | **11. Health Approval Inspection Detail / scheduling state** | Starts the approval inspection process, which must include a served notice before inspection. |
| `Back` | **09. Health Approval Worklist** | Returns to the eligibility list. |

---

## 11. Health Approval Inspection Detail

**Purpose:** Let the MOH track the approval inspection they scheduled.

| Clickable item | Destination | What happens there |
|---|---|---|
| `View notice` | **Inspection notice detail** | Shows the notice, service attempts, and acknowledgement status. |
| `View premises` | **Premises compliance view** | Opens the premises' wider compliance record. |
| `View completed inspection` | **12. Health Approval Decision Review** | Opens the completed checklist and officer recommendation when field work is finished. |
| `Back` | **09. Health Approval Worklist** | Returns to the Health Approval worklist. |

> The inspection itself is carried out by the EHO. The MOH does not complete the field checklist.

---

## 12. Health Approval Decision Review

**Purpose:** Give the MOH the evidence required before deciding Health Approval.

The SRS requires the MOH to see:

- Completed inspection checklist
- Officer recommendation
- Current Fitness status
- Current Fumigation status

| Clickable item | Destination | What happens there |
|---|---|---|
| Checklist item | **Inspection detail / finding detail** | Shows the field evidence and result for that item. |
| Officer recommendation | **Recommendation detail** | Shows the EHO's recommendation and supporting inspection record. |
| Fitness status | **Relevant Fitness certificate detail** | Shows the underlying staff-compliance state. |
| Fumigation status | **Relevant Fumigation certificate detail** | Shows the underlying premises-treatment state. |
| Contravention | **Contravention detail** | Shows what was wrong, required corrective action, and deadline. |
| `Make decision` | **13. Health Approval Decision & Issue** | Opens the final MOH decision step. |
| `Back` | **09. Health Approval Worklist** | Returns without making a decision. |

---

## 13. Health Approval Decision & Issue

**Purpose:** Record the Health Approval decision.

The SRS allows three outcomes:

- `Approve`
- `Refuse`
- `Approve with conditions`

Every outcome requires a written reason.

| Clickable item | Destination | What happens there |
|---|---|---|
| `Approve and issue` | **Password re-entry → Issued Health Approval** | Issues and locks the Health Approval Certificate. |
| `Approve with conditions` | **Password re-entry → Issued Health Approval** | Issues the certificate with the recorded conditions and reason. |
| `Refuse` | **Decision confirmation** | Records the refusal and reason and informs the premises. |
| `Override expiry` | **Same screen — reason required** | Allows an authorised expiry override with a written reason. |
| `Cancel` | **12. Health Approval Decision Review** | Returns to the evidence review without deciding. |

---

# 6. Suspension, Revocation, and Withdrawal

## 14. Certificate Action Queue

**Purpose:** Show certificates requiring an MOH status decision.

Cases can reach this queue from:

- Inspection findings
- Expired/revoked underlying certificates
- Returned pest infestation
- Health Approval marked `At Risk`
- Other authorised enforcement triggers

| Clickable item | Destination | What happens there |
|---|---|---|
| Action row | **15. Certificate Action Review** | Opens the certificate, evidence, current status, and proposed action. |
| Certificate link | **Certificate detail** | Shows the certificate exactly as issued and its status history. |
| `Filter` | **Same screen** | Filters by action type, certificate type, or urgency. |
| `Back` | **02. MOH Home / Decision Queue** | Returns to the main console. |

---

## 15. Certificate Action Review

**Purpose:** Let the MOH review evidence before changing a certificate's legal status.

| Clickable item | Destination | What happens there |
|---|---|---|
| Inspection finding | **Inspection / finding detail** | Shows the field evidence supporting the proposed action. |
| Underlying certificate | **Certificate detail** | Shows the certificate relationship causing an `At Risk` state. |
| Premises | **Premises compliance view** | Opens the full compliance record. |
| `Suspend / revoke / withdraw` | **16. Certificate Action Confirmation** | Opens the authorised status-change step appropriate to the certificate and evidence. |
| `No action` | **Queue / recorded outcome** | Records that the MOH reviewed the case and did not change the certificate status. |
| `Back` | **14. Certificate Action Queue** | Returns without making a status decision. |

### Important rule

The system may put a decision in front of the MOH, but it must **never automatically suspend or revoke**.

---

## 16. Certificate Action Confirmation

**Purpose:** Record the final authorised status change.

| Clickable item | Destination | What happens there |
|---|---|---|
| `Confirm suspension` | **Password re-entry → Certificate detail** | Records the suspension, reason, note, officer, and time. |
| `Confirm revocation` | **Password re-entry → Certificate detail** | Records the revocation and its supporting reason. |
| `Confirm withdrawal` | **Password re-entry → Certificate detail** | Records withdrawal where permitted, including its effective date. |
| `Set withdrawal effective date` | **Same screen** | Lets the MOH set the effective date, including an earlier date where the SRS permits it. |
| `Cancel` | **15. Certificate Action Review** | Returns without changing certificate status. |

---

# 7. Facility and Provider Approval

## 17. Partner Approval Queue

**Purpose:** Show facilities and licensed providers requiring MOH approval.

| Clickable item | Destination | What happens there |
|---|---|---|
| Facility row | **18. Facility Approval Review** | Opens the facility, services, approval information, and submitted details. |
| Provider row | **19. Provider Approval Review** | Opens the provider, registration information, licence details, services, and submitted details. |
| `Filter` | **Same screen** | Filters partner approval requests by type or status. |
| `Back` | **02. MOH Home / Decision Queue** | Returns to the MOH home screen. |

> The SRS states that the MOH/Director approves facilities and providers.

---

## 18. Facility Approval Review

**Purpose:** Let the MOH decide whether a facility may appear to applicants as an approved medical facility.

| Clickable item | Destination | What happens there |
|---|---|---|
| Supporting document | **Document detail** | Opens evidence submitted for facility approval. |
| Services | **Same screen — service detail** | Shows services the facility proposes to offer. |
| `Approve facility` | **Approval confirmation** | Records the facility as approved for the relevant approval period. |
| `Refuse` | **Decision confirmation** | Records refusal and its reason. |
| `Back` | **17. Partner Approval Queue** | Returns without deciding. |

---

## 19. Provider Approval Review

**Purpose:** Let the MOH decide whether a pest-control provider may operate as a licensed provider in the system.

| Clickable item | Destination | What happens there |
|---|---|---|
| Registration/licence document | **Document detail** | Opens the provider's supporting registration or licence evidence. |
| Services | **Same screen — service detail** | Shows the services the provider proposes to offer. |
| `Approve provider` | **Approval confirmation** | Records the provider as approved/licensed for the relevant period. |
| `Refuse` | **Decision confirmation** | Records refusal and its reason. |
| `Back` | **17. Partner Approval Queue** | Returns without deciding. |

---

# 8. Reporting

## 20. Reports

**Purpose:** Give the MOH access to reporting supported by the officer console.

The SRS explicitly supports compliance reporting by:

- Premises
- Ward
- Council
- State-wide

| Clickable item | Destination | What happens there |
|---|---|---|
| Compliance report | **Report detail** | Shows compliance data for the selected reporting scope. |
| Premises row | **Premises compliance view** | Opens the premises behind the report result. |
| `Filter` | **Same screen** | Changes reporting scope or period where supported. |
| `Back` | **02. MOH Home / Decision Queue** | Returns to the MOH home screen. |

> The SRS does not define the exact charts, exports, or report layouts, so this document does not invent them.

---

# 9. Objections and Appeals

The SRS says an applicant must be able to object to:

- A refusal
- A suspension
- An inspection finding

The system must record what was decided.

However, the **legal appeal route still needs confirmation**.

For that reason, a full MOH objection workflow is **not defined here**.

If the MOH is later confirmed as the deciding authority, it would require a separate objection queue and decision screen.

---

# 10. Complete MOH End-to-End Flow

```text
Sign In
   ↓
MOH Home / Decision Queue
   │
   ├── Fitness Decision Queue
   │      ↓
   │   Fitness Case Review
   │      ↓
   │   Fitness Decision & Issue
   │      ↓
   │   Issued / Refused
   │
   ├── Fumigation Decision Queue
   │      ↓
   │   Fumigation Case Review
   │      ↓
   │   Fumigation Decision & Issue
   │      ↓
   │   Issued / Refused
   │
   ├── Health Approval Worklist
   │      ↓
   │   Eligibility Detail
   │      ↓
   │   Schedule Approval Inspection
   │      ↓
   │   EHO completes inspection
   │      ↓
   │   Health Approval Decision Review
   │      ↓
   │   Approve / Approve with Conditions / Refuse
   │
   ├── Certificate Action Queue
   │      ↓
   │   Certificate Action Review
   │      ↓
   │   Suspend / Revoke / Withdraw / No Action
   │
   ├── Partner Approval Queue
   │      ├── Facility Approval Review
   │      └── Provider Approval Review
   │
   └── Reports
```

---

# 11. Screen Inventory

| # | Screen | Source basis |
|---|---|---|
| 01 | Sign In | Required system access/security; screen boundary assumed |
| 02 | MOH Home / Decision Queue | Officer console explicitly requires approval queues |
| 03 | Fitness Decision Queue | Derived from MOH Fitness decision responsibility |
| 04 | Fitness Case Review | Required to review facility results before issuance |
| 05 | Fitness Decision & Issue | Explicit MOH issue decision |
| 06 | Fumigation Decision Queue | Derived from MOH Fumigation decision responsibility |
| 07 | Fumigation Case Review | Required to review provider report + EHO confirmation |
| 08 | Fumigation Decision & Issue | Explicit MOH issue decision |
| 09 | Health Approval Worklist | Explicit Health Approval eligibility list |
| 10 | Health Approval Eligibility Detail | Required to inspect underlying eligibility |
| 11 | Health Approval Inspection Detail | MOH explicitly schedules approval inspection |
| 12 | Health Approval Decision Review | Explicit completed checklist + recommendation review |
| 13 | Health Approval Decision & Issue | Explicit approve/refuse/approve with conditions |
| 14 | Certificate Action Queue | Officer console explicitly supports suspending/revoking |
| 15 | Certificate Action Review | Required evidence review before status change |
| 16 | Certificate Action Confirmation | Explicit authorised suspend/revoke/withdraw action |
| 17 | Partner Approval Queue | MOH explicitly approves facilities/providers |
| 18 | Facility Approval Review | Derived from facility approval responsibility |
| 19 | Provider Approval Review | Derived from provider approval responsibility |
| 20 | Reports | Explicit officer-console/reporting requirement |

---

# 12. Gaps / Decisions Surfaced by the Flow

These are **not new requirements**.

| Gap | What is unclear |
|---|---|
| Price approval ownership | Section 2 says the MOH approves facility/provider prices, while the Finance Console section says Finance Officers handle price-list approval. This responsibility must be reconciled before the UX is finalized. |
| Partner onboarding submission | The SRS identifies approval but does not define the exact submission flow used by facilities/providers before MOH review. |
| Fitness refusal options | The SRS clearly describes issuance and blocking on `Refer`, but does not fully specify the exact MOH refusal controls for every result combination. |
| Fumigation disputed report | The EHO may dispute a provider report, but the SRS does not define what the MOH should do next with a disputed report. |
| Inspection scheduling mechanics | The MOH must schedule Health Approval inspections, but the exact scheduling/assignment UI is not defined. |
| EHO recommendation format | The MOH must see the officer's recommendation, but the allowed recommendation values are not specified. |
| Objection authority | Objections are required, but the legal route and deciding authority are unresolved. |
| Reporting detail | Reporting exists, but report layouts, exports, and MOH-specific metrics are not defined. |
| Partner suspension/reapproval | The SRS discusses approval status and expiry but does not fully define the MOH workflow for reapproval, suspension, or reinstatement of partners. |

## Lean UX Recommendation

For the MOH, keep the product centred around **four primary jobs**:

1. **Decide certificate applications**
2. **Decide Health Approval**
3. **Decide certificate status changes**
4. **Approve regulated partners**

The home screen should therefore behave like a **decision inbox**, with the most urgent pending decisions surfaced first.
