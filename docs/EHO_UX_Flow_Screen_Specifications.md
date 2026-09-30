---
title: "EHO UX Flow Screen Specifications"
---

# EHO UX Flow Screen Specifications

## Scope
This document covers the **Environmental Health Officer (EHO)** experience for inspections and fumigation supervision.

**Assumptions**
- EHO accounts are created by an internal administrator; there is no public EHO signup.
- EHOs do not issue, suspend, revoke, or withdraw certificates.
- Inspections cannot be recorded unless the required notice has been served.
- The field experience must support offline use.

---

## 1. Sign In

**Purpose**  
Allow an EHO to securely access the field app.

**Components**
- Email / staff ID
- Password
- Forgot password
- Sign in button
- Offline status / connectivity indicator

**Empty State**
- N/A

**Primary CTA**
- **Sign in**

**Alternative Actions**
- Forgot password
- Contact administrator

**Edge Cases**
- Invalid credentials
- Disabled account
- No internet on first login
- Session expired

---

## 2. Home / My Work

**Purpose**  
Show available council work, the EHO's claimed jobs, completed inspections, and follow-up work that needs attention.

**Components**
- Summary cards: Open, Assigned, Completed, Follow-up
- Tabs: My Jobs, Follow-up, Completed
- Search within each work table
- Job tables with premises, reference, scheduled date, status, and action
- Overdue status where a pending visit is past its scheduled date
- Fumigation supervision jobs
- Status chips: Assigned, In progress, Waiting to sync, Follow-up due, Overdue, Completed
- Sync / offline status

**Empty State**
- “No assigned jobs.”

**Primary CTA**
- **Browse open jobs**

**Alternative Actions**
- Continue an assigned draft
- Open a follow-up
- View a completed record
- Open fumigation jobs

**Edge Cases**
- Assignment removed after sync
- Multiple officers assigned
- Stale offline data
- Overdue inspection

---

## 3. Inspection List

**Purpose**  
Let the EHO search available council inspections and claim a job. Claiming removes it from the open queue and creates a draft under My Jobs.

**Components**
- Searchable inspection table
- Premises name and address
- Inspection type
- Date / time
- Notice status
- Status: Open and, where applicable, Overdue

**Empty State**
- “No open inspections.”

**Primary CTA**
- **Assign to me**

**Alternative Actions**
- Search inspections
- Return to My Work

**Edge Cases**
- Notice not served
- Inspection rescheduled
- Inspection claimed by another EHO before selection
- Duplicate-looking premises

---

## 4. Inspection Overview

**Purpose**  
Prepare the EHO before starting the visit.

**Components**
- Premises summary
- Inspection type
- Date / time
- Notice status and acknowledgement
- Assigned officers
- Previous inspection summary
- Outstanding contraventions
- Certificate summary
- Supporting documents summary

**Empty State**
- “No previous inspection history.”

**Primary CTA**
- **Start inspection**

**Alternative Actions**
- View premises details
- View notice
- View previous inspections

**Edge Cases**
- Notice not served → Start disabled
- Inspection scheduled for another date
- Certificate data unavailable offline
- Different officer attends than originally assigned

---

## 5. Premises Compliance View

**Purpose**  
Give the EHO one view of the premises' current compliance position.

**Components**
- Health Approval status
- Fumigation Certificate status
- Food handler Fitness Certificate statuses
- Supporting documents
- Outstanding contraventions
- Inspection history
- Status labels: Valid, Expiring Soon, Expired, Suspended, Revoked, Not Found

**Empty State**
- “No compliance records found.”

**Primary CTA**
- **Return to inspection**

**Alternative Actions**
- View certificate
- Record paper certificate seen
- View inspection history

**Edge Cases**
- Record not found must not equal non-compliant
- Paper certificate exists but no digital record
- Expired certificate
- Staff on-site differs from recorded staff
- Data may be stale offline

---

## 6. Inspection Checklist

**Purpose**  
Capture inspection findings efficiently in the field.

**Components**
- Checklist sections
- Each item:
  - Satisfactory
  - Contravention
  - Not applicable
  - Unable to check
- Notes field
- Add photo
- Auto-filled certificate checks
- Progress indicator
- Save locally

**Empty State**
- N/A

**Primary CTA**
- **Complete inspection**

**Alternative Actions**
- Save and continue later
- View premises compliance
- Add evidence

**Edge Cases**
- Required item unanswered
- Camera permission denied
- Photo fails to save
- App closes mid-inspection
- Offline mode
- Checklist version changed after inspection began

---

## 7. Contravention Detail

**Purpose**  
Record what is wrong and what the business must correct.

**Components**
- Checklist item
- Description of issue
- Required corrective action
- Deadline
- Notes
- Photo / evidence attachment

**Empty State**
- N/A

**Primary CTA**
- **Save contravention**

**Alternative Actions**
- Add evidence
- Cancel

**Edge Cases**
- Missing corrective action
- Missing deadline
- Multiple contraventions under one checklist item
- Evidence unavailable

---

## 8. Inspection Review & Submit

**Purpose**  
Let the EHO review findings before submission.

**Components**
- Inspection summary
- Checklist completion status
- Contraventions
- Evidence count
- Officers who attended
- Offline / sync status

**Empty State**
- N/A

**Primary CTA**
- **Submit inspection**

**Alternative Actions**
- Edit checklist
- Edit contraventions
- Save draft

**Edge Cases**
- Incomplete required items
- No network → queue submission
- Sync conflict
- Attending officers differ from assigned officers
- Duplicate submit attempt

---

## 9. Submission Result

**Purpose**  
Confirm that the inspection has been captured and show the next step.

**Components**
- Submission status
- Sync status
- Outcome summary
- Contravention count
- Follow-up requirement
- Findings notice status

**Empty State**
- N/A

**Primary CTA**
- **Back to My Work**

**Alternative Actions**
- View inspection
- View findings notice
- Open follow-up

**Edge Cases**
- Submission queued offline
- Server rejects conflicting data
- Findings notice generation fails

---

## 10. Findings Notice

**Purpose**  
Show the formal findings generated from contraventions.

**Components**
- Premises
- Inspection reference
- Contraventions
- Required actions
- Deadlines
- Delivery channels
- Service / acknowledgement status

**Empty State**
- “No findings notice required.”

**Primary CTA**
- **View delivery status**

**Alternative Actions**
- View inspection
- Download / print notice where permitted

**Edge Cases**
- SMS/email delivery failure
- No acknowledgement
- Hand delivery required
- Notice resent through another channel

---

## 11. Follow-Up Inspection

**Purpose**  
Check whether previously identified issues were corrected.

**Components**
- Previous contraventions
- Original deadline
- Evidence from prior inspection
- Status per issue:
  - Resolved
  - Still outstanding
  - Unable to verify
- New issue capture
- Follow-up checklist where required

**Empty State**
- “No outstanding issues.”

**Primary CTA**
- **Complete follow-up**

**Alternative Actions**
- Add new contravention
- View previous inspection

**Edge Cases**
- Follow-up notice not served
- Business unavailable
- Some issues resolved, others not
- New contraventions found
- Deadline already passed

---

## 12. Fumigation Supervision List

**Purpose**  
Show fumigation jobs the EHO is assigned to supervise.

**Components**
- Premises
- Provider
- Scheduled date / time
- Job status
- Provider report status

**Empty State**
- “No fumigation supervision jobs assigned.”

**Primary CTA**
- **Open job**

**Alternative Actions**
- Search jobs
- View premises

**Edge Cases**
- Provider reschedules
- EHO reassigned
- Job cancelled

---

## 13. Fumigation Supervision Detail

**Purpose**  
Allow the EHO to review and confirm or dispute the provider's completed job report.

**Components**
- Premises details
- Provider details
- Scheduled work information
- Provider job report
- Areas treated
- Pests targeted
- Chemicals / methods used
- Notes / evidence

**Empty State**
- “Provider report not submitted yet.”

**Primary CTA**
- **Confirm report**

**Alternative Actions**
- Dispute report
- Add note / evidence
- View premises

**Edge Cases**
- Provider report incomplete
- Work differs from report
- EHO did not attend
- Report submitted after scheduled date
- Offline confirmation pending sync

---

## 14. Premises Search

**Purpose**  
Allow the EHO to quickly find a business or premises.

**Components**
- Search field
- Search by premises name, reference, address
- Barcode / QR scan
- Recent premises

**Empty State**
- “No premises found.”

**Primary CTA**
- **Open premises**

**Alternative Actions**
- Scan code
- Retry search

**Edge Cases**
- Multiple similar results
- Record belongs to another council
- No digital record
- Offline search limited to cached premises

---

## 15. Profile / App Status

**Purpose**  
Show the EHO's account, device, and sync state.

**Components**
- Name
- Role
- Council
- Assigned area, if used
- Last sync time
- Offline data status
- Sign out

**Empty State**
- N/A

**Primary CTA**
- **Sync now**

**Alternative Actions**
- Sign out

**Edge Cases**
- Sync fails
- Device storage full
- Account disabled while offline
- Pending unsynced work before sign out
