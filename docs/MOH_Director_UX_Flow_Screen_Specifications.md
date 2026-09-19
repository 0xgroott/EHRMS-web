---
title: "MOH / Director UX Flow Screen Specifications"
---

# MOH / Director UX Flow Screen Specifications

## Scope
This document covers the **Medical Officer of Health (MOH) / Director** experience for reviewing cases, making certificate decisions, and handling certificate status changes.

**Assumptions**
- MOH / Director accounts are created internally by an administrator; there is no public signup.
- The MOH / Director is primarily a review and decision-making role, not a field inspection role.
- Issuing, suspending, revoking, and withdrawing certificates are restricted to this role.
- Sensitive decisions require password re-entry and 2FA where required.
- Issued certificates cannot be edited; corrections require cancellation and re-issue.

---

## 1. Sign In

**Purpose**  
Allow the MOH / Director to securely access the internal console.

**Components**
- Email / staff ID
- Password
- Forgot password
- 2FA step
- Sign in button

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
- 2FA failure
- Session expired

---

## 2. Home / Approval Dashboard

**Purpose**  
Show all cases requiring MOH / Director attention.

**Components**
- Fitness applications awaiting decision
- Fumigation cases awaiting decision
- Health Approval cases awaiting decision
- Certificates at risk
- Suspension / revocation / withdrawal cases
- Objections / contested cases
- Priority / overdue indicators
- Search

**Empty State**
- “No cases require your attention.”

**Primary CTA**
- **Review case**

**Alternative Actions**
- View all approvals
- Open at-risk cases
- Search premises / certificate

**Edge Cases**
- Case reassigned
- Case updated while open
- Required evidence still pending
- Duplicate-looking cases

---

## 3. Approval Queue

**Purpose**  
Let the MOH / Director review all pending decisions.

**Components**
- Case list
- Case type
- Applicant / premises
- Current stage
- Submission date
- Assigned council
- Filters: Fitness, Fumigation, Health Approval, At Risk

**Empty State**
- “No cases match this filter.”

**Primary CTA**
- **Open case**

**Alternative Actions**
- Change filter
- Search
- Sort by date / priority

**Edge Cases**
- Incomplete case
- Duplicate submission
- Case already decided by another authorized user
- Council access restriction

---

## 4. Fitness Certificate Review

**Purpose**  
Review fitness results before issuing or refusing a Fitness Certificate.

**Components**
- Applicant / employer
- Person list
- Facility
- Test date
- Result per person: Fit / Not Fit / Refer
- Supporting medical documents
- Consent status
- Existing certificate history

**Empty State**
- “No medical result available yet.”

**Primary CTA**
- **Issue certificate**

**Alternative Actions**
- Refuse
- Remove unresolved person where permitted
- Return to queue

**Edge Cases**
- Person still marked Refer
- Missing consent
- Missing facility result
- Mixed outcomes across multiple people
- Existing valid certificate already present

---

## 5. Fumigation Certificate Review

**Purpose**  
Review completed fumigation work before issuing a Fumigation Certificate.

**Components**
- Premises
- Provider
- Work date
- Supervising EHO
- Provider job report
- Areas treated
- Pests targeted
- Chemicals / methods used
- EHO confirmation / dispute
- Supporting evidence

**Empty State**
- “Provider report not available yet.”

**Primary CTA**
- **Issue certificate**

**Alternative Actions**
- Refuse / hold decision
- Review EHO dispute
- Return to queue

**Edge Cases**
- Provider report disputed
- Supervising EHO not recorded
- Incomplete job report
- Work date mismatch
- Provider licence no longer valid

---

## 6. Health Approval Review

**Purpose**  
Review inspection results and underlying compliance before deciding Health Approval.

**Components**
- Premises
- Inspection checklist
- EHO recommendation
- Contraventions
- Fitness Certificate status
- Fumigation Certificate status
- Supporting documents
- Previous Health Approval history

**Empty State**
- “Inspection result not available yet.”

**Primary CTA**
- **Approve**

**Alternative Actions**
- Approve with conditions
- Refuse
- View premises history

**Edge Cases**
- Underlying certificate expired
- Contraventions still open
- Inspection incomplete
- Certificate becomes invalid during review
- Conflicting EHO findings

---

## 7. Decision Confirmation

**Purpose**  
Confirm a legal decision before it is applied.

**Components**
- Decision summary
- Written reason
- Effective date where applicable
- Password re-entry
- 2FA confirmation where required
- Warning that issued records cannot be edited

**Empty State**
- N/A

**Primary CTA**
- **Confirm decision**

**Alternative Actions**
- Cancel
- Return to case

**Edge Cases**
- Missing required reason
- Invalid password
- 2FA failure
- Case changed since review
- User no longer has permission

---

## 8. Decision Result

**Purpose**  
Confirm that the decision was recorded successfully.

**Components**
- Decision status
- Certificate number where issued
- Issue / effective date
- Expiry date
- Notification status
- Audit trail reference

**Empty State**
- N/A

**Primary CTA**
- **Back to Approval Queue**

**Alternative Actions**
- View certificate
- View premises
- Review next case

**Edge Cases**
- Certificate generation fails
- Notification delivery fails
- Duplicate confirmation attempt

---

## 9. At-Risk Certificates

**Purpose**  
Show certificates requiring review because underlying compliance has changed.

**Components**
- Certificate
- Premises / person
- Risk reason
- Triggering event
- Date flagged
- Current status
- Related inspection / certificate

**Empty State**
- “No certificates currently at risk.”

**Primary CTA**
- **Review risk**

**Alternative Actions**
- View premises
- View triggering event

**Edge Cases**
- Underlying issue already resolved
- Multiple risk triggers
- Certificate already expired
- Conflicting status updates

---

## 10. Suspend / Revoke / Withdraw Review

**Purpose**  
Allow the MOH / Director to change an existing certificate status where justified.

**Components**
- Certificate details
- Current status
- Triggering inspection / evidence
- Reason
- Notes
- Effective date
- Previous status changes

**Empty State**
- N/A

**Primary CTA**
- **Confirm status change**

**Alternative Actions**
- Cancel
- View evidence
- Return to certificate

**Edge Cases**
- Certificate already inactive
- Backdated effective date
- Missing evidence
- Existing objection / appeal
- Status changed by another authorized user

---

## 11. Objection / Appeal Review

**Purpose**  
Review a contested refusal, suspension, or inspection finding where assigned.

**Components**
- Decision being contested
- Grounds
- Attachments
- Original case evidence
- Prior decision
- Outcome notes

**Empty State**
- “No objection details available.”

**Primary CTA**
- **Record outcome**

**Alternative Actions**
- View original case
- Request clarification where process allows

**Edge Cases**
- Appeal route not configured
- Missing grounds
- Duplicate objection
- Decision already replaced

---

## 12. Certificate Detail

**Purpose**  
View the full legal and status history of a certificate.

**Components**
- Certificate type
- Certificate number
- Subject
- Issue date
- Expiry date
- Current status
- Issuing officer
- Status history
- Related inspection / application
- Barcode / verification reference

**Empty State**
- “Certificate not found.”

**Primary CTA**
- **View related case**

**Alternative Actions**
- Suspend / revoke / withdraw where permitted
- Reprint
- View premises / person

**Edge Cases**
- Certificate replaced
- Certificate cancelled and re-issued
- Expired certificate
- Historical settings version

---

## 13. Premises View

**Purpose**  
Give the MOH / Director a complete view of one premises before making decisions.

**Components**
- Health Approval
- Fumigation Certificate
- Staff Fitness Certificates
- Supporting documents
- Inspection history
- Outstanding contraventions
- Certificate status history

**Empty State**
- “No compliance records found.”

**Primary CTA**
- **Open related case**

**Alternative Actions**
- View certificate
- View inspection history
- Search another premises

**Edge Cases**
- Records from another council
- Paper-only historical certificate
- Missing digital record
- Conflicting current statuses

---

## 14. Search

**Purpose**  
Allow the MOH / Director to find cases, premises, people, and certificates.

**Components**
- Search field
- Search by:
  - Premises name
  - Certificate number
  - Application reference
  - Person
- Filters
- Recent searches

**Empty State**
- “No matching records found.”

**Primary CTA**
- **Open result**

**Alternative Actions**
- Change filters
- Clear search

**Edge Cases**
- Multiple similar records
- Restricted council record
- Historical record only
- No digital match

---

## 15. Profile / Security

**Purpose**  
Show account details and security status.

**Components**
- Name
- Role
- Council
- 2FA status
- Active sessions
- Sign out

**Empty State**
- N/A

**Primary CTA**
- **Manage security**

**Alternative Actions**
- Sign out

**Edge Cases**
- 2FA unavailable
- Account permission changed
- Session revoked
