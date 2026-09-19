---
title: "EHRCMS Business User — End-to-End UX Flow Map"
---

# EHRCMS Business User — End-to-End UX Flow Map

## Scope

This document maps how the **business user** moves across the currently defined business-facing screens to complete onboarding, Fitness Certificate, Fumigation Certificate, Health Approval, inspection, corrective-action, and follow-up tasks.

It is a navigation companion to the existing **Business Portal UX Flow Screen Specifications**. It does not redefine screen contents.

## Core Flow

**Create Account → Verify Contact → Register Business & Premises → Business Dashboard**

From the dashboard, the business can move into:

- **Food Handlers → Fitness Application → Facility → Payment → Assessment → Decision → Fitness Certificate**
- **Fumigation Application → Provider → Payment → Service → Decision → Fumigation Certificate**
- **Health Approval Details → Inspection Notice → Inspection Findings → Follow-up Inspection → Resolution / Escalation**

Health Approval is **not directly applied for**. The system exposes it when the required Fitness and Fumigation conditions are satisfied.

---

# 1. Account and Premises Setup

## 01. Create Account

| Clickable item | Destination | What happens there |
|---|---|---|
| `Create account` | **02. Verify Contact** | The user confirms ownership of the phone number or email used during registration. |
| `Sign in` | **Screen gap: Sign In** | Existing users authenticate and continue to their business account. |
| `Continue a saved registration` | **03. Register Business and Premises** | The user's saved registration draft is restored. |

## 02. Verify Contact

| Clickable item | Destination | What happens there |
|---|---|---|
| `Verify and continue` | **03. Register Business and Premises** | Successful verification unlocks business and premises registration. |
| `Resend code` | **Same screen** | A new verification code is sent and the countdown restarts. |
| `Change phone/email` | **Contact details step** | The user changes the contact destination before requesting another code. |
| `Sign out` | **Screen gap: Sign In / Entry** | The current registration session ends. |

## 03. Register Business and Premises

| Clickable item | Destination | What happens there |
|---|---|---|
| `Save and continue` | **04. Business Dashboard** | A completed business/premises profile becomes the base record for certificate applications. |
| `Save draft` | **Same screen** | Progress is stored without completing registration. |
| `Exit to dashboard` | **04. Business Dashboard** | The user leaves registration; incomplete profile status remains visible on the dashboard. |

---

# 2. Business Dashboard

## 04. Business Dashboard

The dashboard is the main return point for the business user.

| Clickable item | Destination | What happens there |
|---|---|---|
| `Start next required action` | **Contextual destination** | Opens the highest-priority task: profile completion, Fitness, Fumigation, inspection acknowledgement, corrective action, or another required step. |
| Fitness card — no application | **07. Start Fitness Application** | The user begins a Fitness Certificate application for eligible food handlers. |
| Fitness card — active application | **12. Fitness Application Details** | The user sees current status, pending action, facility result, and decision progress. |
| Fitness card — certificate issued | **13. Fitness Certificate Details** | The user sees the issued certificate and staff-level validity. |
| Fumigation card — no application | **14. Start Fumigation Application** | The user begins a Fumigation Certificate application for the premises. |
| Fumigation card — active application | **17. Fumigation Application Details** | The user tracks the provider service, report, EHO confirmation, and MOH decision. |
| Fumigation card — certificate issued | **18. Fumigation Certificate Details** | The user sees the current premises certificate and validity. |
| Health Approval card | **19. Health Approval Details** | The user sees eligibility, missing conditions, inspection status, and decision state. |
| `Manage food handlers` | **05. Food Handlers** | The user manages staff records used in Fitness applications. |
| `View applications` | **Screen gap: Applications List** | This requires either a dedicated application list or a defined dashboard application section. |
| `View inspections` | **Screen gap: Inspections List** | This requires either a dedicated inspection list or a defined dashboard inspection section. |
| `Update business profile` | **03. Register Business and Premises — edit mode** | The user updates editable business and premises information. |
| `View receipts` | **Screen gap: Receipts List** | This requires either a dedicated receipt history or a defined dashboard receipt section. |
| Inspection/corrective-action alert | **20, 21, or 22 depending status** | The user is taken directly to the inspection task requiring attention. |

---

# 3. Food Handlers and Fitness Certificate

## 05. Food Handlers

| Clickable item | Destination | What happens there |
|---|---|---|
| `Add food handler` | **06. Add or Edit Food Handler** | The user creates a staff record for use in Fitness applications. |
| Staff row / `Edit` | **06. Add or Edit Food Handler** | The selected staff record opens for editing where permitted. |
| `Archive former staff` | **Same screen / confirmation** | The staff member is removed from the active workforce without altering issued certificate history. |
| `Start Fitness application` | **07. Start Fitness Application** | Eligible staff can be selected for a new Fitness application. |
| `Import records` | **Not currently defined** | This remains unavailable unless later approved. |

## 06. Add or Edit Food Handler

| Clickable item | Destination | What happens there |
|---|---|---|
| `Save food handler` | **05. Food Handlers** | The record is saved and the user returns to the staff list. |
| `Save and add another` | **06. Add or Edit Food Handler — new record** | The current record is saved and a blank form opens for another staff member. |
| `Cancel` | **05. Food Handlers** | The user returns without saving new changes. |
| `Archive record` | **05. Food Handlers** | After confirmation, the record becomes inactive and the user returns to the staff list. |

## 07. Start Fitness Application

| Clickable item | Destination | What happens there |
|---|---|---|
| `Choose facility` | **08. Choose Approved Facility** | The user compares currently approved facilities for the selected staff. |
| `Save draft` | **Same screen / Dashboard on exit** | The selected staff and readiness state are retained for later completion. |
| `Edit staff record` | **06. Add or Edit Food Handler** | The selected staff record opens so missing or incorrect information can be corrected. |
| `Remove selected person` | **Same screen** | The person is removed from the current application selection only. |

## 08. Choose Approved Facility

| Clickable item | Destination | What happens there |
|---|---|---|
| `Select facility` | **09. Review Fitness Application** | The chosen facility and its current approved price are attached to the application. |
| `View facility details` | **Same screen detail / modal recommended** | More partner information is shown without adding another required workflow screen. |
| `Change filters` | **Same screen** | The facility list updates to match the selected filters. |
| `Go back` | **07. Start Fitness Application** | The user returns to the staff-selection step. |
| `Save draft` | **Same screen / Dashboard on exit** | The application is kept without selecting a facility. |

## 09. Review Fitness Application

| Clickable item | Destination | What happens there |
|---|---|---|
| `Proceed to payment` | **10. Service Payment** | The confirmed service total is handed to the payment step. |
| `Change facility` | **08. Choose Approved Facility** | The user returns to partner selection before payment. |
| `Edit staff selection` | **07. Start Fitness Application** | The user changes which food handlers are included. |
| `Save and exit` | **04. Business Dashboard** | The application stays in draft and can be resumed later. |
| `Cancel application` | **04. Business Dashboard after confirmation** | The draft is cancelled and the user returns to the dashboard. |

## 10. Service Payment

This is a shared payment screen used by both Fitness and Fumigation applications.

| Clickable item | Destination | What happens there |
|---|---|---|
| `Pay now` | **External payment provider → 11. Payment Confirmation and Service Instructions** | The user pays the single service price; successful confirmation returns them to EHRCMS. |
| `Pay later` | **Previous application review screen** | The application remains unpaid and no service is treated as booked. |
| `Return to application` | **09 or 16 depending application type** | The user returns to the relevant review screen without paying. |
| `Change partner before payment` | **08 or 15 depending application type** | The user returns to facility/provider selection before any payment is made. |

## 11. Payment Confirmation and Service Instructions

| Clickable item | Destination | What happens there |
|---|---|---|
| `View application` | **12. Fitness Application Details** or **17. Fumigation Application Details** | The user enters the live application tracker after payment confirmation. |
| `Download receipt` | **File download** | The payment receipt is downloaded without opening another workflow screen. |
| `Contact facility/provider` | **External phone/email action** | The business coordinates the service using the partner contact and case reference. |
| `Return to dashboard` | **04. Business Dashboard** | The user leaves the payment flow and returns to the compliance overview. |

## 12. Fitness Application Details

| Clickable item | Destination | What happens there |
|---|---|---|
| `Complete required action` | **Contextual step** | The user is sent to the specific unresolved action shown by the application status. |
| `Contact facility` | **External phone/email action** | The business contacts the selected facility about assessment coordination. |
| `Download receipt` | **File download** | The service payment receipt is downloaded. |
| `Withdraw unresolved person` | **Same screen / confirmation** | Where permitted, one unresolved person is removed without editing issued records. |
| `View decision` | **Decision section on this screen** | The user sees the MOH outcome without private medical details. |
| Issued certificate link | **13. Fitness Certificate Details** | The issued Fitness Certificate opens with current validity information. |

## 13. Fitness Certificate Details

| Clickable item | Destination | What happens there |
|---|---|---|
| `Download certificate` | **File download** | The issued certificate is downloaded in its original issued form. |
| `Verify certificate` | **Public Check Page** | The certificate's public validity record opens without exposing medical information. |
| `Start renewal` | **07. Start Fitness Application — prefilled** | A fresh application begins using eligible information from the existing record. |
| `View application` | **12. Fitness Application Details** | The user returns to the application that produced the certificate. |
| `Add newly hired staff member` | **05. Food Handlers** | The user adds the new employee before starting the required new Fitness application. |

---

# 4. Fumigation Certificate

## 14. Start Fumigation Application

| Clickable item | Destination | What happens there |
|---|---|---|
| `Choose provider` | **15. Choose Licensed Provider** | The business compares currently licensed providers for the premises. |
| `Save draft` | **Same screen / Dashboard on exit** | The application is stored for later completion. |
| `Update premises details` | **03. Register Business and Premises — edit mode** | The user corrects premises information before continuing. |
| `Cancel` | **04. Business Dashboard** | The current start flow ends without progressing to partner selection. |

## 15. Choose Licensed Provider

| Clickable item | Destination | What happens there |
|---|---|---|
| `Select provider` | **16. Review Fumigation Application** | The provider and its approved price are attached to the application. |
| `View provider details` | **Same screen detail / modal recommended** | Additional provider information is shown without creating another required page. |
| `Change filters` | **Same screen** | The provider list updates using the selected filters. |
| `Go back` | **14. Start Fumigation Application** | The user returns to the premises/service step. |
| `Save draft` | **Same screen / Dashboard on exit** | The application remains incomplete and unpaid. |

## 16. Review Fumigation Application

| Clickable item | Destination | What happens there |
|---|---|---|
| `Proceed to payment` | **10. Service Payment** | The confirmed fumigation service price is sent to payment. |
| `Change provider` | **15. Choose Licensed Provider** | The user selects another licensed provider before payment. |
| `Edit application` | **14. Start Fumigation Application** | The premises/service information can be changed before payment. |
| `Save and exit` | **04. Business Dashboard** | The unpaid application remains saved as a draft. |
| `Cancel application` | **04. Business Dashboard after confirmation** | The draft is cancelled and the user returns to the dashboard. |

## 17. Fumigation Application Details

| Clickable item | Destination | What happens there |
|---|---|---|
| `Complete required action` | **Contextual step** | The user is sent to the unresolved action appropriate to the current application status. |
| `Contact provider` | **External phone/email action** | The business contacts the provider using the case reference. |
| `Download receipt` | **File download** | The fumigation service receipt is downloaded. |
| `View decision` | **Decision section on this screen** | The user sees the MOH outcome after the provider report and EHO confirmation. |
| `Report a scheduling issue` | **Contact / support action** | The issue is raised without altering the authorised service or certificate workflow. |
| Issued certificate link | **18. Fumigation Certificate Details** | The issued premises certificate opens with current validity information. |

## 18. Fumigation Certificate Details

| Clickable item | Destination | What happens there |
|---|---|---|
| `Download certificate` | **File download** | The issued premises certificate is downloaded. |
| `Verify certificate` | **Public Check Page** | The public validity record for the certificate opens. |
| `Start renewal` | **14. Start Fumigation Application — prefilled** | A new application begins without extending the old certificate. |
| `View fumigation history` | **Screen gap: Fumigation History** | A history view is referenced but has not been defined as a business-facing screen. |
| `View application` | **17. Fumigation Application Details** | The user returns to the application that produced the certificate. |

---

# 5. Health Approval and Inspection

## 19. Health Approval Details

| Clickable item | Destination | What happens there |
|---|---|---|
| `Complete missing requirement` | **Relevant Fitness or Fumigation flow** | The user is sent directly to the requirement blocking Health Approval eligibility. |
| `View inspection notice` | **20. Inspection Notice Details** | The current inspection notice and acknowledgement state open. |
| `View findings` | **21. Inspection Findings and Corrective Actions** | The user sees contraventions, required fixes, and deadlines. |
| `View decision` | **Decision section on this screen** | The Health Approval outcome and any conditions are shown. |
| `Download Health Approval` | **File download** | The issued Health Approval Certificate is downloaded. |

## 20. Inspection Notice Details

| Clickable item | Destination | What happens there |
|---|---|---|
| `Acknowledge notice` | **Same screen** | The acknowledgement is recorded and the notice status updates. |
| `Download notice` | **File download** | The served inspection notice is downloaded. |
| `Contact the council` | **External contact action** | The business contacts the issuing council about the inspection. |
| `Return to Health Approval details` | **19. Health Approval Details** | The user returns to the eligibility and inspection overview. |

After the inspection occurs, the next business-facing state is either:

**No contravention → Health Approval / inspection outcome**, or  
**Contravention found → 21. Inspection Findings and Corrective Actions**

## 21. Inspection Findings and Corrective Actions

| Clickable item | Destination | What happens there |
|---|---|---|
| `View required actions` | **Same screen — corrective-action section** | The business sees each contravention, required correction, and deadline. |
| `Download findings notice` | **File download** | The official findings notice is downloaded. |
| `Upload remediation evidence` | **Same screen / upload flow if approved** | Evidence can support review but must not automatically close a contravention. |
| `Contact the council` | **External contact action** | The business can clarify findings or corrective requirements. |
| `Object to a finding` | **Screen gap: Objection Flow** | The SRS permits objections, but the legal route, authority, and deadlines are still unresolved. |
| Follow-up inspection link | **22. Follow-up Inspection Details** | The business opens the separate follow-up notice and follow-up status. |

## 22. Follow-up Inspection Details

| Clickable item | Destination | What happens there |
|---|---|---|
| `Acknowledge follow-up notice` | **Same screen** | The separate follow-up notice is acknowledged and recorded. |
| `View original findings` | **21. Inspection Findings and Corrective Actions** | The business returns to the contraventions that caused the follow-up. |
| `Download follow-up notice` | **File download** | The follow-up inspection notice is downloaded. |
| `View submitted evidence` | **Same screen / evidence detail** | Previously submitted remediation evidence is shown for reference. |
| `Contact the council` | **External contact action** | The business contacts the council about the follow-up. |
| `View final decision` | **19. Health Approval Details or affected certificate details** | The user sees the authorised outcome, including resolution, refusal, withdrawal, suspension, or revocation where applicable. |

### Follow-up outcome

**All contraventions resolved → Requirements satisfied → relevant approval/certificate state updates**

**Some contraventions remain → Further action required → authorised officer decides the next step**

The system must not automatically suspend or revoke a certificate.

---

# 6. Full Business User Flow

```text
Create Account
    ↓
Verify Contact
    ↓
Register Business & Premises
    ↓
Business Dashboard
    ├── Food Handlers
    │      ↓
    │   Start Fitness Application
    │      ↓
    │   Choose Approved Facility
    │      ↓
    │   Review Fitness Application
    │      ↓
    │   Service Payment
    │      ↓
    │   Payment Confirmation
    │      ↓
    │   Fitness Application Details
    │      ↓
    │   Fitness Certificate Details
    │
    ├── Start Fumigation Application
    │      ↓
    │   Choose Licensed Provider
    │      ↓
    │   Review Fumigation Application
    │      ↓
    │   Service Payment
    │      ↓
    │   Payment Confirmation
    │      ↓
    │   Fumigation Application Details
    │      ↓
    │   Fumigation Certificate Details
    │
    └── Health Approval Details
           ↓
        Inspection Notice Details
           ↓
        Inspection occurs
           ↓
        Inspection Findings & Corrective Actions
           ↓
        Follow-up Inspection Details
           ↓
        Resolved or escalated
           ↓
        Health Approval / affected certificate decision
```

---

# 7. Navigation Gaps Surfaced by This Map

These are **not new requirements**. They are clickable destinations already implied by the current screen specification but do not yet have defined screens.

| Gap | Why it surfaced | Lean recommendation |
|---|---|---|
| Sign In | `Sign in` and `Sign out` exist in onboarding | Define one simple authentication screen. |
| Applications List | Dashboard has `View applications` | Add only if users need to browse multiple current/past applications; otherwise use a dashboard section. |
| Inspections List | Dashboard has `View inspections` | Add only if businesses can have multiple inspections; otherwise route alerts directly to the active inspection. |
| Receipts List | Dashboard has `View receipts` | Avoid a separate screen if receipts can live inside application/payment history. |
| Fumigation History | Certificate screen references it | Could be a section within Fumigation Certificate Details instead of a new page. |
| Objection Flow | Findings screen includes `Object to a finding` | Do not define until the legal route, authority, and deadlines are confirmed. |

## Lean Navigation Recommendation

To avoid unnecessary screens, keep the **Business Dashboard as the hub** and route users directly into the current task. Only create separate list/history screens where users genuinely need to browse multiple records.
