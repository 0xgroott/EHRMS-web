---
title: "EHRCMS Environmental Health Officer (EHO) — End-to-End UX Flow Map"
---

# EHRCMS Environmental Health Officer (EHO) — End-to-End UX Flow Map

## Scope

This document maps how the **Environmental Health Officer (EHO)** navigates across the defined EHO screens to complete inspection and fumigation-supervision tasks.

It is based directly on the **EHO UX Flow Screen Specifications** and acts as the navigation companion to that document.

## Core Navigation

**Sign In → Home / My Work**

From **Home / My Work**, the EHO can move into:

- **Inspection List → Inspection Overview → Inspection Checklist → Review & Submit → Submission Result**
- **Premises Compliance View → Certificate / Inspection History / Paper Certificate Capture**
- **Findings Notice → Follow-Up Inspection**
- **Fumigation Supervision List → Fumigation Supervision Detail**
- **Premises Search → Premises Compliance View**
- **Profile → Account and session information**
- **Sync Data → Device status and saved-work sync**

---

# 1. Sign In

## 01. Sign In

| Clickable item | Destination | What happens there |
|---|---|---|
| `Sign in` | **02. Home / My Work** | The EHO securely enters the field app and sees assigned work. |
| `Forgot password` | **Password recovery flow** | The EHO starts the account recovery process. |
| `Contact administrator` | **External support/contact action** | The EHO contacts the internal administrator for account support. |

---

# 2. Home and Work Navigation

## 02. Home / My Work

| Clickable item | Destination | What happens there |
|---|---|---|
| `Browse open jobs` | **03. Inspection List** | Opens the available council inspection queue. |
| My Jobs row / `Open job` or `Continue` | **04. Inspection Overview** | Opens a claimed inspection and its saved draft. |
| Follow-up row / `Open follow-up` | **11. Follow-Up Inspection** | Opens a verification visit created by completed fieldwork. |
| Completed row / `View record` | **04. Inspection Overview — completed state** | Opens the signed-off inspection record. |
| `Search premises` | **14. Premises Search** | Lets the EHO search for a business or premises outside the active inspection flow. |
| `Open fumigation jobs` | **12. Fumigation Supervision List** | Opens fumigation jobs assigned to the EHO. |
| Profile control | **15. Profile** | Opens the officer's account and session information. |
| `Sync Data` | **16. Sync Data** | Opens device, offline, queued-work, and sync information. |

---

## 03. Inspection List

| Clickable item | Destination | What happens there |
|---|---|---|
| Inspection row / `Assign to me` | **04. Inspection Overview** | Claims the open inspection, creates a local draft, removes it from the open queue, and opens its overview. |
| `Search open jobs` | **Same screen** | Narrows the available inspection list by premises, address, or reference. |
| Back navigation | **02. Home / My Work** | Returns to the EHO's assigned-work overview. |

---

# 3. Inspection Preparation

## 04. Inspection Overview

| Clickable item | Destination | What happens there |
|---|---|---|
| `Start inspection` | **06. Inspection Checklist** | Opens the field checklist when the required notice has been served. |
| `View premises details` | **05. Premises Compliance View** | Shows current certificates, documents, contraventions, and inspection history. |
| `View notice` | **Inspection notice detail / notice view** | Shows the served inspection notice and acknowledgement state. |
| `View previous inspections` | **Premises Compliance View → Inspection History** | Shows prior inspection records for the premises. |
| Back navigation | **03. Inspection List** | Returns to the inspection list. |

### Blocked state

If the required notice has not been served, `Start inspection` remains disabled.

---

## 05. Premises Compliance View

| Clickable item | Destination | What happens there |
|---|---|---|
| `Return to inspection` | **04. Inspection Overview** or **06. Inspection Checklist** | Returns the EHO to the active inspection context. |
| `View certificate` | **Certificate detail view** | Opens the selected certificate's status and details. |
| `Record paper certificate seen` | **Paper certificate capture flow** | Lets the EHO record a physical certificate seen where no digital record exists. |
| `View inspection history` | **Inspection history view** | Shows previous inspections and related outcomes for the premises. |
| Outstanding contravention | **07. Contravention Detail** | Opens the related contravention record and corrective requirement. |

### Important behaviour

`Not Found` must remain different from `Non-compliant`.

---

# 4. Conducting the Inspection

## 06. Inspection Checklist

| Clickable item | Destination | What happens there |
|---|---|---|
| Checklist item marked `Contravention` | **07. Contravention Detail** | Opens the issue details so corrective action and deadline can be recorded. |
| `Complete inspection` | **08. Inspection Review & Submit** | Opens the final review before submission. |
| `Save and continue later` | **04. Inspection Overview** or saved draft state | Saves the current checklist progress without submitting. |
| `View premises compliance` | **05. Premises Compliance View** | Shows live/cached compliance information without leaving the inspection workflow. |
| `Add evidence` | **Photo / evidence capture within current inspection** | Adds photographic or note evidence to the inspection. |

---

## 07. Contravention Detail

| Clickable item | Destination | What happens there |
|---|---|---|
| `Save contravention` | **06. Inspection Checklist** | Saves the issue, corrective action, deadline, and evidence against the inspection. |
| `Add evidence` | **Evidence capture on same screen** | Adds supporting photo or attachment evidence. |
| `Cancel` | **06. Inspection Checklist** | Returns to the checklist without saving the new contravention. |

---

## 08. Inspection Review & Submit

| Clickable item | Destination | What happens there |
|---|---|---|
| `Submit inspection` | **09. Submission Result** | Submits the completed inspection or queues it for sync if offline. |
| `Edit checklist` | **06. Inspection Checklist** | Returns to the checklist so findings can be corrected. |
| `Edit contraventions` | **07. Contravention Detail** | Reopens contravention records for correction before submission. |
| `Save draft` | **04. Inspection Overview / saved state** | Saves the inspection without submitting it. |

---

## 09. Submission Result

| Clickable item | Destination | What happens there |
|---|---|---|
| `Back to My Work` | **02. Home / My Work** | Returns to assigned work after submission or queueing. |
| `View inspection` | **04. Inspection Overview — completed state** | Shows the completed inspection record. |
| `View findings notice` | **10. Findings Notice** | Opens the formal findings notice generated from recorded contraventions. |
| `Open follow-up` | **11. Follow-Up Inspection** | Opens the follow-up inspection created for unresolved corrective actions. |

---

# 5. Findings and Follow-Up

## 10. Findings Notice

| Clickable item | Destination | What happens there |
|---|---|---|
| `View delivery status` | **Same screen — delivery/service section** | Shows how the findings notice was sent and whether it was acknowledged. |
| `View inspection` | **04. Inspection Overview — completed state** | Returns to the source inspection. |
| `Download / print notice` | **File/print action** | Opens the findings notice for download or printing where permitted. |
| Follow-up link, where available | **11. Follow-Up Inspection** | Opens the follow-up created from the corrective-action deadline. |

---

## 11. Follow-Up Inspection

| Clickable item | Destination | What happens there |
|---|---|---|
| `Complete follow-up` | **08. Inspection Review & Submit** | Sends the follow-up findings through the same review/submission step used for inspections. |
| `Add new contravention` | **07. Contravention Detail** | Records a new issue discovered during the follow-up. |
| `View previous inspection` | **04. Inspection Overview — historical/completed state** | Opens the original inspection that created the follow-up. |
| Previous contravention | **07. Contravention Detail — existing record** | Shows the original issue, corrective requirement, and deadline. |

### Follow-up outcomes

Each previous issue can be marked:

- `Resolved`
- `Still outstanding`
- `Unable to verify`

New issues can also be recorded.

---

# 6. Fumigation Supervision

## 12. Fumigation Supervision List

| Clickable item | Destination | What happens there |
|---|---|---|
| Job row / `Open job` | **13. Fumigation Supervision Detail** | Opens the assigned fumigation job and provider report status. |
| `Search jobs` | **Same screen** | Filters the fumigation job list. |
| `View premises` | **05. Premises Compliance View** | Opens the compliance record for the job's premises. |
| Back navigation | **02. Home / My Work** | Returns to the EHO's work overview. |

---

## 13. Fumigation Supervision Detail

| Clickable item | Destination | What happens there |
|---|---|---|
| `Confirm report` | **Same screen → confirmed state / task completion** | Records that the EHO confirms the provider's completed job report. |
| `Dispute report` | **Same screen → dispute state** | Records that the EHO disputes the provider's report because it does not match observed work. |
| `Add note / evidence` | **Same screen** | Adds supporting information to the supervision record. |
| `View premises` | **05. Premises Compliance View** | Opens the premises' wider compliance record. |
| Back navigation | **12. Fumigation Supervision List** | Returns to the assigned fumigation jobs. |

> The EHO only confirms or disputes the provider report. Certificate decisions remain outside the EHO role.

---

# 7. Premises Search

## 14. Premises Search

| Clickable item | Destination | What happens there |
|---|---|---|
| Search result / `Open premises` | **05. Premises Compliance View** | Opens the selected premises' compliance position. |
| `Scan code` | **05. Premises Compliance View** or certificate verification result | Uses the scanned barcode/QR code to retrieve the relevant premises or certificate record. |
| `Retry search` | **Same screen** | Re-runs the search after a failed or empty result. |
| Recent premises item | **05. Premises Compliance View** | Reopens a recently accessed premises. |
| Back navigation | **02. Home / My Work** | Returns to the EHO work overview. |

---

# 8. Profile, Offline Status, and Sync

## 15. Profile

| Clickable item | Destination | What happens there |
|---|---|---|
| `Sign out` | **01. Sign In** | Ends the EHO session after handling any pending unsynced work. |

## 16. Sync Data

| Clickable item | Destination | What happens there |
|---|---|---|
| `Sync now` | **Same screen** | Attempts to upload unsynced field work and refresh cached data. |
| Queued inspection | **04. Inspection Overview** | Opens the saved inspection record waiting to sync. |

### Offline behaviour

The EHO can continue using:

- Assigned work already cached
- Inspection checklists
- Notes
- Photos/evidence
- Findings

When connectivity returns, pending work is synced.

---

# 9. Full EHO End-to-End Flow

```text
Sign In
   ↓
Home / My Work
   │
   ├── Inspection List
   │      ↓
   │   Inspection Overview
   │      ├── Premises Compliance View
   │      ├── Notice View
   │      └── Previous Inspections
   │      ↓
   │   Inspection Checklist
   │      └── Contravention Detail
   │      ↓
   │   Inspection Review & Submit
   │      ↓
   │   Submission Result
   │      ├── Findings Notice
   │      └── Follow-Up Inspection
   │              ↓
   │         Review & Submit
   │
   ├── Fumigation Supervision List
   │      ↓
   │   Fumigation Supervision Detail
   │      ├── Confirm report
   │      └── Dispute report
   │
   ├── Premises Search
   │      ↓
   │   Premises Compliance View
   │
   ├── Sync Data
   │      ↓
   │   Sync now / Queued work
   │
   └── Profile
          ↓
       Account details / Sign out
```

---

# 10. Screen Inventory

| # | Screen |
|---|---|
| 01 | Sign In |
| 02 | Home / My Work |
| 03 | Inspection List |
| 04 | Inspection Overview |
| 05 | Premises Compliance View |
| 06 | Inspection Checklist |
| 07 | Contravention Detail |
| 08 | Inspection Review & Submit |
| 09 | Submission Result |
| 10 | Findings Notice |
| 11 | Follow-Up Inspection |
| 12 | Fumigation Supervision List |
| 13 | Fumigation Supervision Detail |
| 14 | Premises Search |
| 15 | Profile |
| 16 | Sync Data |

---

# 11. Navigation Gaps Surfaced by the Screen Spec

These are **not new requirements**. They are destinations or behaviours implied by the current screen specification that do not yet have their own defined screen.

| Gap | Why it surfaced | Lean recommendation |
|---|---|---|
| Inspection Notice Detail | `View notice` exists on Inspection Overview | Keep as a simple detail view or sheet rather than a major standalone module. |
| Certificate Detail | `View certificate` exists on Premises Compliance View | Use one reusable certificate-detail view across certificate types. |
| Paper Certificate Capture | `Record paper certificate seen` exists | Use a compact form/modal rather than a full module. |
| Inspection History | `View inspection history` / `View previous inspections` exists | Use one history list nested under the premises record. |
| Password Recovery | `Forgot password` exists | Use the standard internal recovery flow. |
| Evidence Capture | `Add evidence` exists across inspection screens | Use one reusable photo/note attachment pattern. |

## Lean UX Recommendation

Keep the EHO experience centred around **four primary navigation areas**:

1. **My Work**
2. **Premises Search**
3. **Sync Data**
4. **Profile**

Everything else should open contextually from those areas rather than adding more top-level navigation.
