# Admin Dashboard — UX Flow Screen Specifications

## Scope

This document defines the shared admin dashboard experience for EHRCMS. Admin roles use the same core interface, with actions shown or hidden based on permission.

**Assumption:** “Super Admin” refers to the highest platform-level administrator with broader cross-council access, user/role management, and configuration oversight. The SRS separately names Supervisor, System Administrator, Settings Administrator, Finance Officer, MOH/Director, and EHO roles, so the final permission matrix should confirm exactly which of these powers belong to Super Admin.

## UX Principles

- One shared admin shell; permissions control available actions.
- Keep operational queues visible and action-oriented.
- Show only information needed to make the current decision.
- Use clear status labels across applications, inspections, certificates, payments, and notices.
- High-risk actions require confirmation and, where required, re-authentication.
- Never allow issued certificates or audit records to be edited.

---

## 1. Admin Sign In

**Purpose**  
Secure access to the admin dashboard.

**Components**
- Email / username
- Password
- 2FA challenge when required
- Forgot password
- Sign-in status/error message

**Empty state**  
N/A

**Primary CTA**  
- Sign in

**Alternative actions**
- Forgot password
- Retry 2FA

**Edge cases**
- Invalid credentials
- Expired/locked account
- Failed or expired 2FA
- User has no active role/council assignment

---

## 2. Dashboard / Work Queue

**Purpose**  
Give admins a quick view of items that need attention.

**Components**
- Summary cards:
  - Applications awaiting action
  - Pending inspections
  - Health Approval eligible premises
  - Expiring certificates
  - Outstanding contraventions
  - Payment/reconciliation issues
- Priority work queue
- Recent activity
- Filters by council, status, type, date
- Search

**Empty state**  
“No items need your attention right now.”

**Primary CTAs**
- Open queued item
- View all work

**Alternative actions**
- Search records
- Filter queue
- View reports

**Edge cases**
- Role has no actionable items
- Cross-council user with no council selected
- Data partially unavailable
- User can view an item but cannot act on it

**Permission notes**
- Queue content changes by role.
- Super Admin may view across councils.
- MOH/Director actions appear only where approval/issuance authority is required.

---

## 3. Applications

**Purpose**  
Review and track Fitness and Fumigation applications.

**Components**
- Applications table
- Search and filters
- Type, applicant, premises, council, stage, payment status, date
- Status chips
- Assigned/related facility or provider

**Empty state**  
“No applications found.”

**Primary CTA**
- Open application

**Alternative actions**
- Export filtered list
- View related premises
- View payment

**Edge cases**
- Application waiting for payment
- Missing supporting document
- Facility/provider approval expired
- Application belongs to another council
- Stale status caused by an external payment delay

---

## 4. Application Detail

**Purpose**  
Provide the full operational record for one application.

**Components**
- Applicant and premises summary
- Application stage
- Supporting documents
- Facility/provider selection
- Appointment/work status
- Payment status
- Results/job report
- Activity timeline
- Decision panel where permitted

**Empty state**  
Use section-level empty states, e.g. “No supporting documents uploaded.”

**Primary CTAs**
- Role-dependent next action
- Approve / Refuse / Request correction where permitted

**Alternative actions**
- View premises
- View payment
- View related documents
- Add internal note

**Edge cases**
- Payment incomplete
- Result still marked “refer”
- Missing required consent
- Required document expired
- Facility/provider loses approval mid-process
- User lacks permission for next action

**Permission notes**
- Only MOH/Director can make issuance-related decisions.
- Payment must never trigger certificate issuance automatically.

---

## 5. Health Approval Eligibility

**Purpose**  
Show premises that now meet the prerequisite conditions for Health Approval inspection.

**Components**
- Eligible premises list
- Fitness status
- Fumigation status
- Missing conditions
- Council
- Eligibility date/status

**Empty state**  
“No premises are currently eligible for Health Approval.”

**Primary CTA**
- Schedule inspection

**Alternative actions**
- Open premises record
- View underlying certificates

**Edge cases**
- One underlying certificate expires after eligibility is shown
- Staff list changes
- Certificate is suspended/revoked
- Premises becomes ineligible before inspection

**Permission notes**
- Scheduling/decision permissions should follow configured roles.
- Super Admin may view across councils.

---

## 6. Inspections

**Purpose**  
Manage routine, complaint-driven, follow-up, and Health Approval inspections.

**Components**
- Inspection list/calendar
- Inspection type
- Premises
- Assigned officers
- Notice status
- Scheduled date
- Inspection status
- Follow-up deadline

**Empty state**  
“No inspections scheduled.”

**Primary CTAs**
- Schedule inspection
- Open inspection

**Alternative actions**
- Bulk schedule
- View premises
- Filter by type/status

**Edge cases**
- Notice not served
- Recipient has not acknowledged notice
- Inspection date passes without completion
- Follow-up inspection is required
- Officer assignment changes

---

## 7. Inspection Detail / Review

**Purpose**  
Review the full inspection record and resulting findings.

**Components**
- Premises summary
- Notice/service record
- Named officers vs actual attendees
- Checklist results
- Photos/evidence
- Contraventions
- Corrective actions and deadlines
- Follow-up status
- Certificate impact

**Empty state**  
“No findings have been recorded yet.”

**Primary CTAs**
- Review findings
- Issue findings notice
- Schedule/confirm follow-up

**Alternative actions**
- View premises
- View previous inspections
- View certificate status

**Edge cases**
- Inspection has no valid served notice
- Evidence has not synced yet
- Conflicting offline submissions
- Contravention deadline has passed
- Inspection finding may require suspension/revocation/withdrawal

**Permission notes**
- Admin review does not bypass the served-notice requirement.
- Certificate status changes remain restricted to MOH/Director.

---

## 8. Premises / Business Directory

**Purpose**  
Find and manage the central record for each regulated business/premises.

**Components**
- Search
- Filters by council, ward, type, compliance/status
- Business/premises name
- Address
- Certificate status summary
- Outstanding contraventions

**Empty state**  
“No premises found.”

**Primary CTA**
- Open premises

**Alternative actions**
- Register premises, if permitted
- Export list

**Edge cases**
- Duplicate premises
- Premises registered under another council
- Missing/legacy paper records
- Business has multiple historical certificates

---

## 9. Premises Detail

**Purpose**  
Show the complete regulatory picture for one premises.

**Components**
- Business/premises details
- Health Approval
- Fumigation Certificate
- Food handler Fitness Certificates
- Supporting documents
- Inspection history
- Outstanding contraventions
- Status history
- Activity timeline

**Empty state**  
Use section-level states, e.g. “No inspection history.”

**Primary CTAs**
- Start/schedule relevant action based on status
- View certificate

**Alternative actions**
- Record paper certificate seen
- View inspection history
- View supporting documents

**Edge cases**
- “Not found” certificate must not be shown as “not compliant”
- Staff on-site differ from certified staff
- Underlying certificate becomes invalid
- Premises has unresolved contraventions

---

## 10. Certificates

**Purpose**  
Search and manage issued Fitness, Fumigation, and Health Approval certificates.

**Components**
- Certificate list
- Type
- Subject
- Council
- Issue date
- Expiry date
- Status
- Search and filters

**Empty state**  
“No certificates found.”

**Primary CTA**
- Open certificate

**Alternative actions**
- Reprint
- View related premises/application
- Filter by expiring/suspended/revoked

**Edge cases**
- Expired certificate
- Replaced certificate
- Suspended/revoked/withdrawn certificate
- Historical certificate uses an older settings version

---

## 11. Certificate Detail

**Purpose**  
Show the immutable issued record and its history.

**Components**
- Certificate preview
- Current status
- Issue/work/expiry dates
- Issuing officer
- Barcode/reference
- Status history
- Related application
- Audit trail

**Empty state**  
N/A

**Primary CTAs**
- Reprint
- Suspend / Revoke / Withdraw where legally applicable and permitted

**Alternative actions**
- View premises/person
- View application
- View audit history

**Edge cases**
- Certificate needs correction
- Backdated withdrawal
- Partial person-level revocation on a multi-person Fitness Certificate
- Replaced certificate

**Permission notes**
- Issued certificates are never edited.
- Correction requires cancellation/replacement.
- Only MOH/Director may issue, suspend, revoke, or withdraw, with re-authentication.

---

## 12. Facilities & Providers

**Purpose**  
Manage approved medical facilities and licensed fumigation providers.

**Components**
- Facility/provider list
- Approval/licence status
- Expiry date
- Services
- Current price status
- Search and filters

**Empty state**  
“No facilities/providers found.”

**Primary CTA**
- Open record

**Alternative actions**
- Add facility/provider, if permitted
- Filter by approval status
- View price list

**Edge cases**
- Approval/licence expired
- Suspended provider
- Duplicate registration number
- Record has active applications when status changes

---

## 13. Facility / Provider Detail

**Purpose**  
Review accreditation, services, pricing, and status.

**Components**
- Organisation details
- Approval/licence information
- Services
- Price list versions
- Active applications/jobs
- Status history

**Empty state**  
“No services or prices submitted yet.”

**Primary CTAs**
- Approve / Suspend record where permitted
- Review price list

**Alternative actions**
- View applications/jobs
- View history

**Edge cases**
- Expired approval/licence
- Price change pending approval
- Provider/facility has active bookings
- Historical price versions must remain unchanged

---

## 14. Price Approval

**Purpose**  
Review and approve facility/provider price lists before publication.

**Components**
- Pending price changes
- Current vs proposed price
- Effective dates
- Facility/provider
- Approval history

**Empty state**  
“No price changes awaiting approval.”

**Primary CTAs**
- Approve price
- Reject / Return for correction

**Alternative actions**
- View previous versions
- Open facility/provider

**Edge cases**
- New price overlaps an existing effective period
- Price changes after an application has already selected the old price
- User attempts to alter a historical price version

---

## 15. Finance

**Purpose**  
Monitor payments, splits, refunds, waivers, and reconciliation in one shared admin area.

**Components**
- Payment summary
- Transactions table
- Payment status
- Split details
- Reconciliation status
- Refund/waiver status
- Search and filters

**Empty state**  
“No payment records found.”

**Primary CTAs**
- Open transaction
- Reconcile flagged payment

**Alternative actions**
- Process refund
- Review waiver
- Export report

**Edge cases**
- Payment channel unavailable
- Payment recorded differently by channel/system
- Refund requires proportional reversal
- Split does not total 100%
- Waiver approval conflicts with separation-of-duty rules

**Permission notes**
- Finance actions are permission-controlled inside the shared dashboard.
- Settings admins cannot access money controls.

---

## 16. Payment Detail

**Purpose**  
Show exactly what was paid and how it was split.

**Components**
- Applicant/application
- Amount
- Payment channel/reference
- Payment status
- Split beneficiaries
- Percentages and amounts
- Receipt
- Reconciliation history
- Refund/waiver history

**Empty state**  
N/A

**Primary CTAs**
- Reconcile
- Refund, if eligible

**Alternative actions**
- View receipt
- View application
- Export transaction record

**Edge cases**
- Duplicate payment reference
- Partial/failed payment
- Reconciliation mismatch
- Historical split rule differs from current settings

---

## 17. Notices & Service Records

**Purpose**  
Track inspection/finding notices and proof of service.

**Components**
- Notice list
- Type
- Premises
- Channel
- Sent status
- Acknowledgement status
- Retry history
- Scheduled inspection

**Empty state**  
“No notices found.”

**Primary CTA**
- Open notice

**Alternative actions**
- Retry next allowed channel
- Print for hand delivery
- View inspection

**Edge cases**
- No email/phone available
- No acknowledgement
- Channel delivery failure
- Notice sent but service not legally established
- Follow-up inspection requires a new notice

---

## 18. Reports

**Purpose**  
Provide operational and compliance reporting.

**Components**
- Report type selector
- Date range
- Council/ward filters
- Certificate/compliance summaries
- Payments and payout reports
- Inspection/contravention summaries
- Export

**Empty state**  
“No data for the selected period.”

**Primary CTA**
- Generate report

**Alternative actions**
- Export
- Change filters

**Edge cases**
- User lacks access to selected council
- Very large date range
- Historical data spans multiple settings versions

**Permission notes**
- Supervisory/Super Admin roles may report across councils.
- Other users remain limited to their assigned council(s).

---

## 19. Users & Roles

**Purpose**  
Manage admin accounts, role assignments, and access scope.

**Components**
- User list
- Role
- Council
- Account status
- Last activity
- 2FA status
- Search and filters

**Empty state**  
“No admin users found.”

**Primary CTAs**
- Add user
- Edit access

**Alternative actions**
- Disable user
- Reset access
- View activity

**Edge cases**
- Removing the last authorised user for a critical role
- User belongs to multiple councils
- Disabled user has pending assigned work
- Role change would create a separation-of-duty conflict

**Super Admin only**
- Create/disable admin accounts
- Assign roles
- Assign council scope
- Manage cross-council access

---

## 20. Settings

**Purpose**  
Manage council-specific configuration without changing software.

**Components**
- Workflow
- Wording/appearance
- Required documents
- Certificate duration rules
- Form fields
- Conditions
- Roles/permissions
- Checklists
- Money settings
- Version/status indicator

**Empty state**  
Use section-level empty states where applicable.

**Primary CTA**
- Edit draft

**Alternative actions**
- Preview
- View published version
- View version history

**Edge cases**
- Unsaved draft
- Conflicting draft version
- Attempt to remove a fixed safeguard
- Effective date overlaps another settings version
- Change would affect only future records, not historical ones

**Permission notes**
- Settings access is permission-controlled.
- Super Admin may oversee settings across councils.
- Fixed safeguards cannot be changed by any admin.

---

## 21. Settings Review & Publish

**Purpose**  
Safely move configuration changes from draft to production.

**Components**
- Change summary
- Before/after comparison
- Effective date
- Approver
- Validation errors
- Version history

**Empty state**  
“No unpublished changes.”

**Primary CTAs**
- Approve
- Publish

**Alternative actions**
- Return to draft
- Preview
- Cancel changes

**Edge cases**
- Split percentages do not total 100%
- Required approval missing
- Effective date invalid
- Safeguard removal attempted
- User lacks publishing permission

---

## 22. Audit Log

**Purpose**  
Provide an immutable record of critical system activity.

**Components**
- Event list
- User
- Role
- Action
- Record affected
- Timestamp
- Reason
- Before/after values where applicable
- Filters/search

**Empty state**  
“No audit events found for this filter.”

**Primary CTA**
- Open event

**Alternative actions**
- Filter
- Export where permitted

**Edge cases**
- Large result set
- User no longer exists
- Historical role/council differs from current assignment

**Permission notes**
- Audit records are read-only and cannot be edited or deleted by any admin.

---

## 23. System / Council Management

**Purpose**  
Manage platform-level council access and system administration.

**Components**
- Council list
- Council status
- Assigned admins
- Configuration status
- System health/integration status where available

**Empty state**  
“No councils configured.”

**Primary CTAs**
- Open council
- Add/configure council

**Alternative actions**
- Manage council admins
- Review settings status

**Edge cases**
- Council has active records during deactivation
- Imported settings fail validation
- Cross-council permissions conflict

**Super Admin only**
- Add/manage councils
- Manage platform-level admin access
- View cross-council operational scope
- Import/export council configuration where permitted

---

# Shared Navigation

Recommended primary navigation:

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
13. System / Councils — Super Admin only

---

# Critical Permission Rules

- Only MOH/Director can issue, suspend, revoke, or withdraw certificates.
- Issued certificates cannot be edited.
- Payment never causes certificate issuance.
- Settings admins cannot issue certificates or manage money.
- The officer deciding an application cannot approve its waiver.
- Audit records cannot be altered or deleted.
- Users are restricted to their council unless they have supervisory/cross-council authority.
- High-risk actions require stronger authentication where required.
