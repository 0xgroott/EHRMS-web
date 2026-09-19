---
title: "EHRCMS Admin & Super Admin — End-to-End UX Flow Map"
---

# EHRCMS Admin & Super Admin — End-to-End UX Flow Map

## Scope

This document maps how **Admin and Super Admin users** navigate the shared EHRCMS admin dashboard to complete their tasks.

Both roles use the **same admin shell**. Permissions determine which actions, councils, and modules are visible.

**Super Admin** uses the same flows, but has additional platform-level permissions for:

- Cross-council visibility
- User and role management
- Council management
- Platform-level admin access
- Cross-council settings oversight
- Import/export of council configuration where permitted

> This document does not duplicate Admin and Super Admin flows. Super Admin-only actions are marked where they occur.

---

# 1. Core Navigation

**Sign In → Dashboard / Work Queue**

Primary navigation:

1. Dashboard
2. Applications
3. Inspections
4. Premises
5. Certificates
6. Facilities & Providers
7. Finance
8. Notices
9. Reports
10. Users & Roles — permission-gated
11. Settings — permission-gated
12. Audit Log — permission-gated
13. System / Councils — **Super Admin only**

---

# 2. Authentication

## 01. Admin Sign In

| Clickable item | Destination | What happens there |
|---|---|---|
| `Sign in` | **02. Dashboard / Work Queue** | Opens the admin dashboard using the user's assigned role and council permissions. |
| `Forgot password` | **Password recovery flow** | Starts account recovery. |
| `Retry 2FA` | **Same screen** | Re-attempts the second-factor verification when required. |

---

# 3. Dashboard

## 02. Dashboard / Work Queue

| Clickable item | Destination | What happens there |
|---|---|---|
| Queued application | **04. Application Detail** | Opens the application requiring attention. |
| Pending inspection | **07. Inspection Detail / Review** | Opens the inspection and its current status. |
| Health Approval eligible premises | **05. Health Approval Eligibility** | Opens the list of premises ready for Health Approval inspection. |
| Expiring certificate | **11. Certificate Detail** | Opens the issued certificate and current status. |
| Outstanding contravention | **07. Inspection Detail / Review** or **09. Premises Detail** | Opens the record containing the unresolved contravention. |
| Payment/reconciliation issue | **16. Payment Detail** | Opens the affected payment record. |
| `View all work` | **Relevant module list** | Opens the full queue for the selected work type. |
| `Search records` | **Relevant searchable module** | Searches applications, premises, certificates, or other accessible records. |
| `View reports` | **18. Reports** | Opens operational and compliance reporting. |
| Council selector | **Same screen** | Changes the visible council scope where the user has access. |

### Super Admin difference

Super Admin can switch across councils and see cross-council work queues.

---

# 4. Applications

## 03. Applications

| Clickable item | Destination | What happens there |
|---|---|---|
| Application row / `Open application` | **04. Application Detail** | Opens the full operational record for the selected Fitness or Fumigation application. |
| `View related premises` | **09. Premises Detail** | Opens the premises linked to the application. |
| `View payment` | **16. Payment Detail** | Opens the application's payment and split information. |
| `Export filtered list` | **Export action** | Downloads the currently filtered application list where permitted. |
| Search / filters | **Same screen** | Narrows the list by type, stage, payment status, council, or date. |

---

## 04. Application Detail

| Clickable item | Destination | What happens there |
|---|---|---|
| Role-dependent next action | **Relevant action flow** | Opens the next permitted action based on application stage and user permission. |
| `Approve / Refuse / Request correction` | **Decision state on same screen or role-specific decision flow** | Records the permitted application action. |
| `View premises` | **09. Premises Detail** | Opens the linked premises record. |
| `View payment` | **16. Payment Detail** | Opens payment details for the application. |
| Supporting document | **Document detail view** | Opens the selected supporting document. |
| `Add internal note` | **Same screen** | Adds an internal operational note to the application timeline. |

> Only MOH/Director can perform issuance-related decisions.

---

# 5. Health Approval Eligibility

## 05. Health Approval Eligibility

| Clickable item | Destination | What happens there |
|---|---|---|
| `Schedule inspection` | **06. Inspections / scheduling state** | Starts the inspection scheduling process for an eligible premises. |
| Premises row / `Open premises record` | **09. Premises Detail** | Opens the full premises compliance record. |
| Fitness certificate | **11. Certificate Detail** | Opens the supporting Fitness Certificate. |
| Fumigation certificate | **11. Certificate Detail** | Opens the supporting Fumigation Certificate. |
| Filters | **Same screen** | Filters eligible premises by council or status. |

### Super Admin difference

Super Admin can view eligible premises across councils.

---

# 6. Inspections

## 06. Inspections

| Clickable item | Destination | What happens there |
|---|---|---|
| `Schedule inspection` | **Inspection scheduling flow** | Creates a new inspection schedule and assigned officer record where permitted. |
| Inspection row / `Open inspection` | **07. Inspection Detail / Review** | Opens the selected inspection. |
| `Bulk schedule` | **Bulk scheduling flow** | Schedules multiple inspections where permission allows. |
| `View premises` | **09. Premises Detail** | Opens the premises linked to the inspection. |
| Filters | **Same screen** | Filters by inspection type, date, notice status, or completion status. |

---

## 07. Inspection Detail / Review

| Clickable item | Destination | What happens there |
|---|---|---|
| `Review findings` | **Same screen — findings section** | Opens the completed checklist, evidence, and contraventions for review. |
| `Issue findings notice` | **17. Notices & Service Records** | Creates or opens the findings notice and its service record. |
| `Schedule / confirm follow-up` | **06. Inspections** | Creates or confirms the required follow-up inspection. |
| `View premises` | **09. Premises Detail** | Opens the premises' full compliance history. |
| `View previous inspections` | **06. Inspections / historical view** | Shows previous inspections for the same premises. |
| `View certificate status` | **11. Certificate Detail** | Opens the related certificate when inspection findings may affect it. |

> Admin review cannot bypass the served-notice requirement. Certificate status changes remain restricted to MOH/Director.

---

# 7. Premises

## 08. Premises / Business Directory

| Clickable item | Destination | What happens there |
|---|---|---|
| Premises row / `Open premises` | **09. Premises Detail** | Opens the complete regulatory record for the selected premises. |
| `Register premises` | **Premises registration flow** | Creates a new premises record where the user has permission. |
| `Export list` | **Export action** | Downloads the filtered premises list where permitted. |
| Search / filters | **Same screen** | Filters by council, ward, type, or compliance status. |

---

## 09. Premises Detail

| Clickable item | Destination | What happens there |
|---|---|---|
| `Start / schedule relevant action` | **Contextual module** | Opens the next permitted action based on the premises' status. |
| `View certificate` | **11. Certificate Detail** | Opens the selected Fitness, Fumigation, or Health Approval Certificate. |
| `Record paper certificate seen` | **Paper certificate capture flow** | Records a legacy/paper certificate where permitted. |
| `View inspection history` | **06. Inspections / historical view** | Shows previous inspections and outcomes. |
| `View supporting documents` | **Document detail/list** | Opens supporting documents linked to the premises. |
| Outstanding contravention | **07. Inspection Detail / Review** | Opens the inspection record containing the unresolved issue. |

---

# 8. Certificates

## 10. Certificates

| Clickable item | Destination | What happens there |
|---|---|---|
| Certificate row / `Open certificate` | **11. Certificate Detail** | Opens the immutable issued certificate and its status history. |
| `Reprint` | **Print/download action** | Reproduces the certificate exactly as issued. |
| `View related premises` | **09. Premises Detail** | Opens the premises linked to the certificate. |
| `View related application` | **04. Application Detail** | Opens the application that produced the certificate. |
| Filters | **Same screen** | Filters certificates by type, council, status, or expiry. |

---

## 11. Certificate Detail

| Clickable item | Destination | What happens there |
|---|---|---|
| `Reprint` | **Print/download action** | Reprints the immutable issued record. |
| `Suspend / Revoke / Withdraw` | **Authorised certificate action flow** | Opens the status-change confirmation where the user has legal permission. |
| `View premises / person` | **09. Premises Detail** or person record | Opens the subject linked to the certificate. |
| `View application` | **04. Application Detail** | Opens the source application. |
| `View audit history` | **22. Audit Log** | Shows the audit events related to the certificate. |

> Only MOH/Director can issue, suspend, revoke, or withdraw certificates.

---

# 9. Facilities & Providers

## 12. Facilities & Providers

| Clickable item | Destination | What happens there |
|---|---|---|
| Facility/provider row / `Open record` | **13. Facility / Provider Detail** | Opens accreditation, services, prices, active work, and status history. |
| `Add facility/provider` | **Partner creation flow** | Creates a new facility/provider record where permitted. |
| `View price list` | **14. Price Approval** | Opens current and pending price-list versions. |
| Filters | **Same screen** | Filters records by approval/licence status. |

---

## 13. Facility / Provider Detail

| Clickable item | Destination | What happens there |
|---|---|---|
| `Approve / Suspend record` | **Status confirmation flow** | Changes the partner approval/licence status where permitted. |
| `Review price list` | **14. Price Approval** | Opens pending and historical prices for the partner. |
| `View applications/jobs` | **03. Applications** or related jobs list | Shows active work linked to the facility/provider. |
| `View history` | **Same screen — history section** | Shows approval, licence, and price changes over time. |

---

## 14. Price Approval

| Clickable item | Destination | What happens there |
|---|---|---|
| `Approve price` | **Approval confirmation** | Approves the pending price version for publication where permitted. |
| `Reject / Return for correction` | **Return/rejection state** | Sends the price change back for correction. |
| `View previous versions` | **Price history view** | Shows historical price versions without allowing edits. |
| `Open facility/provider` | **13. Facility / Provider Detail** | Returns to the partner record. |

> Price approval is permission-controlled. Historical price versions remain immutable.

---

# 10. Finance

## 15. Finance

| Clickable item | Destination | What happens there |
|---|---|---|
| Transaction row / `Open transaction` | **16. Payment Detail** | Opens the payment, split, receipt, and reconciliation history. |
| `Reconcile flagged payment` | **16. Payment Detail** | Opens the payment requiring reconciliation. |
| `Process refund` | **Refund action flow** | Starts a refund where the user has permission. |
| `Review waiver` | **Waiver action flow** | Opens a waiver request where permitted. |
| `Export report` | **Export action** | Downloads finance records within the user's scope. |

> Finance actions are permission-controlled. Settings admins cannot access money controls.

---

## 16. Payment Detail

| Clickable item | Destination | What happens there |
|---|---|---|
| `Reconcile` | **Same screen / reconciliation state** | Records or resolves a payment reconciliation issue. |
| `Refund` | **Refund action flow** | Starts an eligible refund. |
| `View receipt` | **Receipt view** | Opens the payment receipt. |
| `View application` | **04. Application Detail** | Opens the linked application. |
| `Export transaction record` | **Export action** | Downloads the payment record where permitted. |

---

# 11. Notices

## 17. Notices & Service Records

| Clickable item | Destination | What happens there |
|---|---|---|
| Notice row / `Open notice` | **Notice detail view** | Opens the notice, service attempts, acknowledgement state, and linked inspection. |
| `Retry next allowed channel` | **Same notice / service action** | Attempts service through the next permitted delivery channel. |
| `Print for hand delivery` | **Print action** | Produces a printable copy for manual service. |
| `View inspection` | **07. Inspection Detail / Review** | Opens the inspection linked to the notice. |

---

# 12. Reports

## 18. Reports

| Clickable item | Destination | What happens there |
|---|---|---|
| `Generate report` | **Same screen — results state** | Generates the selected report using the chosen filters. |
| `Export` | **Export action** | Downloads the generated report where permitted. |
| Council / ward / date filters | **Same screen** | Changes the reporting scope and regenerates the result. |
| Premises / certificate result link | **Relevant record detail** | Opens the underlying record behind the report result. |

### Super Admin difference

Super Admin can report across councils. Regular admins remain limited to assigned council scope.

---

# 13. Users & Roles

## 19. Users & Roles

**Permission-gated. Super Admin has the broadest access here.**

| Clickable item | Destination | What happens there |
|---|---|---|
| User row | **User access detail/edit view** | Opens the user's role, council scope, status, and activity. |
| `Add user` | **User creation flow** | Creates a new admin account where permitted. |
| `Edit access` | **User access detail/edit view** | Changes role or council assignment where permitted. |
| `Disable user` | **Disable confirmation** | Disables the selected account after confirmation. |
| `Reset access` | **Access reset flow** | Resets account access or authentication where permitted. |
| `View activity` | **22. Audit Log** | Shows the user's recorded system activity. |

### Super Admin-only permissions

- Create/disable admin accounts
- Assign roles
- Assign council scope
- Manage cross-council access

Regular admins only see/manage users where their permissions allow.

---

# 14. Settings

## 20. Settings

| Clickable item | Destination | What happens there |
|---|---|---|
| `Edit draft` | **Settings editing state** | Opens the current draft configuration for permitted changes. |
| `Preview` | **Settings preview** | Shows how the draft will behave before publication. |
| `View published version` | **Published settings view** | Shows the configuration currently in force. |
| `View version history` | **Settings history view** | Shows previous immutable configuration versions. |
| `Review changes` | **21. Settings Review & Publish** | Opens the draft-versus-published comparison before approval/publication. |

### Super Admin difference

Super Admin may oversee settings across councils.

---

## 21. Settings Review & Publish

| Clickable item | Destination | What happens there |
|---|---|---|
| `Approve` | **Same screen — approved state** | Records approval of the configuration draft where permitted. |
| `Publish` | **Published settings version** | Makes the approved configuration active from the effective date. |
| `Return to draft` | **20. Settings** | Reopens the draft for corrections. |
| `Preview` | **Settings preview** | Shows the proposed configuration before publication. |
| `Cancel changes` | **20. Settings** | Abandons the unpublished draft where permitted. |

> Fixed safeguards cannot be changed by any admin.

---

# 15. Audit Log

## 22. Audit Log

| Clickable item | Destination | What happens there |
|---|---|---|
| Event row / `Open event` | **Audit event detail** | Shows the actor, action, timestamp, reason, and before/after values. |
| `Filter` | **Same screen** | Narrows the audit log by user, action, record, date, or role. |
| `Export` | **Export action** | Downloads audit results where permitted. |
| Affected record link | **Relevant record detail** | Opens the application, certificate, payment, settings version, or other referenced record. |

> Audit records are read-only and cannot be edited or deleted by any admin.

---

# 16. System / Council Management

## 23. System / Council Management — Super Admin Only

| Clickable item | Destination | What happens there |
|---|---|---|
| Council row / `Open council` | **Council detail view** | Opens council status, assigned admins, and configuration state. |
| `Add / configure council` | **Council setup flow** | Creates or configures a council where permitted. |
| `Manage council admins` | **19. Users & Roles** | Opens users filtered to the selected council. |
| `Review settings status` | **20. Settings** | Opens the selected council's configuration status. |
| `Import configuration` | **Configuration import flow** | Imports a council configuration where permitted and validates it before use. |
| `Export configuration` | **Configuration export action** | Exports the selected council configuration. |

### Super Admin-only permissions

- Add/manage councils
- Manage platform-level admin access
- View cross-council operational scope
- Import/export council configuration where permitted

---

# 17. Complete Shared Admin Flow

```text
Sign In
   ↓
Dashboard / Work Queue
   │
   ├── Applications
   │      ↓
   │   Application Detail
   │      ├── Premises
   │      ├── Payment
   │      └── Documents / permitted action
   │
   ├── Health Approval Eligibility
   │      ↓
   │   Schedule Inspection
   │
   ├── Inspections
   │      ↓
   │   Inspection Detail / Review
   │      ├── Findings Notice
   │      ├── Follow-up
   │      ├── Premises
   │      └── Certificate Status
   │
   ├── Premises Directory
   │      ↓
   │   Premises Detail
   │      ├── Certificates
   │      ├── Inspections
   │      └── Supporting Documents
   │
   ├── Certificates
   │      ↓
   │   Certificate Detail
   │
   ├── Facilities & Providers
   │      ↓
   │   Facility / Provider Detail
   │      ↓
   │   Price Approval
   │
   ├── Finance
   │      ↓
   │   Payment Detail
   │
   ├── Notices
   │
   ├── Reports
   │
   ├── Users & Roles [permission-gated]
   │
   ├── Settings
   │      ↓
   │   Settings Review & Publish
   │
   ├── Audit Log
   │
   └── System / Councils [SUPER ADMIN ONLY]
```

---

# 18. Admin vs Super Admin Summary

| Area | Admin | Super Admin |
|---|---|---|
| Shared dashboard shell | Yes | Yes |
| Applications | Within assigned scope | Cross-council where permitted |
| Inspections | Within assigned scope | Cross-council where permitted |
| Premises | Within assigned scope | Cross-council where permitted |
| Certificates | Within assigned scope | Cross-council where permitted |
| Facilities & Providers | Permission-based | Broader oversight |
| Finance | Permission-based | Permission-based; not automatically unrestricted |
| Reports | Assigned council(s) | Cross-council reporting |
| Users & Roles | Limited / permission-based | Full platform-level user and scope management |
| Settings | Permission-based | Cross-council oversight |
| Audit Log | Permission-based | Broader platform visibility |
| System / Councils | No | **Yes — Super Admin only** |

---

# 19. Navigation Gaps Surfaced by the Screen Spec

These are **not new requirements**. They are implied destinations that do not yet have their own full screen specification.

| Gap | Why it surfaced |
|---|---|
| Password Recovery | `Forgot password` exists on Sign In. |
| Inspection Scheduling | Inspections can be scheduled and bulk scheduled, but the scheduling form is not separately specified. |
| Notice Detail | Notices can be opened, but only the list screen is specified. |
| User Access Detail | Users can be edited, but the user-detail/edit screen is not separately specified. |
| Council Detail / Setup | Super Admin can open/add councils, but the council setup/detail screens are not separately specified. |
| Paper Certificate Capture | Premises Detail allows paper certificate recording, but the capture screen is not separately specified. |
| Refund / Waiver Action | Finance supports refunds and waivers, but their dedicated action screens are not separately specified. |

## Lean UX Recommendation

Use **one shared admin shell** with permissions controlling:

- Navigation visibility
- Council scope
- Available CTAs
- High-risk actions

Do not create a separate Super Admin product. Super Admin should use the same screens with broader scope and a small number of extra platform-level controls.
