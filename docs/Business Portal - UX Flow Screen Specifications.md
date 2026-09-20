---
title: "EHRCMS Business Portal UX Flow Screen Specifications"
---

# EHRCMS Business Portal UX Flow Screen Specifications

## Scope

Business onboarding, certificate applications, and business-facing inspection actions.

This document defines the business-facing screens required to register a premises, manage food-handler records, apply for Fitness and Fumigation Certificates, pay for services, track applications, monitor Health Approval eligibility, receive inspection findings, resolve contraventions, and complete follow-up inspections.

## Confirmed Product Rules

- The business is the applicant and platform user.
- Food handlers are records managed by the business. They do not access the platform.
- Approved facilities and licensed providers submit results through secure case-specific forms. They do not need dashboards.
- The business chooses an approved partner based on service, location, contact details, price, and availability.
- The business pays once for the selected service.
- Payment does not guarantee certificate issuance.
- Health Approval cannot be applied for directly.
- Employers can see `Fit`, `Not Fit`, or `Refer`, but not private medical information.
- Every inspection requires a served notice before findings can be recorded.
- A follow-up inspection requires its own notice and acknowledgement.
- The system must not automatically suspend or revoke a certificate.

## Lean Flow

**Create account → Register business and premises → Add food handlers → Apply for Fitness Certificate → Choose facility → Pay → Complete assessment → Track decision → Apply for Fumigation Certificate → Choose provider → Pay → Complete fumigation → Track decision → Health Approval eligibility → Inspection notice → Inspection → Findings and corrective actions → Follow-up inspection → Resolved or escalated**

## Open Decisions

- Multi-premises accounts have not been defined. Each application must relate to one premises.
- In-app appointment scheduling has not been confirmed.
- For the lean MVP, appointment coordination can happen off-platform using the partner's contact details and a case reference.
- Required documents, tests, and council-specific fields must remain configurable.
- The legal process, review authority, and deadlines for objections are still unresolved.
- Allowing businesses to upload remediation evidence is a recommendation, not a confirmed SRS requirement.

## Shared Interface Rules

- Use one clear primary CTA per screen.
- Automatically save progress on application forms.
- Every application and inspection page should show:
  - Current status
  - Next required action
  - Who currently owns the task
  - Relevant deadline
- Use plain language and mobile-first layouts.
- Support slow connections and clear retry states.
- Never expose payment splits, laboratory documents, or private medical information to the business.
- Uploaded remediation evidence must never automatically close a contravention.

---

# A. Account and Premises Setup

## 01. Create Account

**Purpose:** Create the business user's login.

**Components:**

- Business name
- Contact person's name
- Phone number
- Email address
- Password or OTP method
- Terms and privacy consent

**Empty state:** Not applicable on first use.

**Primary CTA:** `Create account`

**Alternative actions:**

- Sign in
- Continue a saved registration

**Edge cases:**

- Phone number or email already exists
- Invalid or unreachable contact
- Weak password
- OTP expiry
- Rate limiting
- Failed network request

---

## 02. Verify Contact

**Purpose:** Confirm that the business controls the supplied phone number or email.

**Components:**

- Masked phone number or email
- OTP field
- Countdown
- Resend control
- Change contact link

**Empty state:** OTP input awaiting entry.

**Primary CTA:** `Verify and continue`

**Alternative actions:**

- Resend code
- Change phone number or email
- Sign out

**Edge cases:**

- Incorrect or expired OTP
- Resend limit reached
- Delayed SMS or email
- Contact already attached to another account

---

## 03. Register Business and Premises

**Purpose:** Create the business and premises record used by every application.

**Components:**

- Business name and type
- Registration details, where required
- Premises name and address
- Council or LGA
- Contact details
- Configurable supporting documents

**Empty state:** Blank form explaining that applications cannot begin until the profile is complete.

**Primary CTA:** `Save and continue`

**Alternative actions:**

- Save draft
- Exit to dashboard

**Edge cases:**

- Address outside a supported council
- Duplicate premises
- Missing required document
- Invalid file or upload failure
- Council-specific fields change while the draft is open

---

## 04. Business Dashboard

**Purpose:** Show the business's compliance status and next required action.

**Components:**

- Profile completion
- Fitness, Fumigation, and Health Approval cards
- Active applications
- Inspection and corrective-action alerts
- Expiry and deadline reminders
- Recent receipts and certificates

**Empty state:** Explain the two starting certificates and show where the business should begin.

**Primary CTA:** `Start next required action`

**Alternative actions:**

- Manage food handlers
- View applications
- View inspections
- Update business profile
- View receipts

**Edge cases:**

- Incomplete business profile
- Application blocked by missing data
- Expired certificate
- Health Approval at risk
- Outstanding contravention
- Multiple urgent actions
- Service unavailable within the council

---

# B. Food Handler Management and Fitness Certificate

## 05. Food Handlers

**Purpose:** Manage the staff records used in Fitness Certificate applications.

**Components:**

- Search and status filters
- Staff list
- Fitness status and certificate expiry
- Selected premises
- Bulk selection

**Empty state:** Explain that food handlers must be added before a Fitness application can begin.

**Primary CTA:** `Add food handler`

**Alternative actions:**

- Edit food handler
- Archive former staff
- Start Fitness application
- Import records if later approved

**Edge cases:**

- Duplicate person
- Incomplete record
- Former staff member in an active application
- Expired Fitness Certificate
- Staff member attached to the wrong premises

---

## 06. Add or Edit Food Handler

**Purpose:** Capture the identity and employment information needed for assessment.

**Components:**

- Full name
- Sex
- Date of birth
- Job or role
- Identity number
- Phone number
- Business branch/location (selected from registered premises; disabled when only one branch exists)
- Consent record
- Configurable council fields

**Empty state:** Blank form for a new record or existing information when editing.

**Primary CTA:** `Save food handler`

**Alternative actions:**

- Cancel
- Archive record where allowed

**Edge cases:**

- Consent missing
- Duplicate identity number
- Invalid date of birth or phone number
- Person already has a valid certificate
- Issued certificate information must not be edited

---

## 07. Start Fitness Application

**Purpose:** Select food handlers and confirm application readiness.

**Components:**

- Eligible staff list
- Selected staff count
- Missing information indicators
- Consent status
- Application summary

**Empty state:** No eligible staff. Direct the user to add staff or complete missing records.

**Primary CTA:** `Choose facility`

**Alternative actions:**

- Save draft
- Edit staff record
- Remove selected person

**Edge cases:**

- Staff have different readiness states
- Staff member already belongs to an active application
- Consent withdrawn
- Selected staff work at different premises
- Newly hired person requires a separate application

---

## 08. Choose Approved Facility

**Purpose:** Allow the business to compare approved facilities and make its own choice.

**Components:**

- Facility name
- Location, area, or distance
- Services offered
- Approved price
- Availability, if supplied
- Contact details
- Filters and comparison options

**Empty state:** No approved facility is available. Save the application and explain that it cannot proceed yet.

**Primary CTA:** `Select facility`

**Alternative actions:**

- Change filters
- View facility details
- Go back
- Save draft

**Edge cases:**

- Facility approval expires
- Facility becomes unavailable
- Facility cannot assess every selected person
- Price changes before selection
- No nearby facility is available

---

## 09. Review Fitness Application

**Purpose:** Confirm the selected people, premises, facility, service, and price before payment.

**Components:**

- Application summary
- Selected staff
- Facility details
- Service total
- Privacy notice
- Editable sections

**Empty state:** Not applicable once a complete draft reaches review.

**Primary CTA:** `Proceed to payment`

**Alternative actions:**

- Change facility
- Edit staff selection
- Save and exit
- Cancel application

**Edge cases:**

- Facility or price becomes invalid
- Staff information changes
- Application data expires
- Duplicate submission
- Required document is removed

---

## 10. Service Payment

**Purpose:** Collect the single service payment through the payment provider.

**Components:**

- Service description
- Facility or provider
- One total price
- Secure payment handoff
- Payment reference
- Payment terms

**Empty state:** Not applicable. This screen only opens for a valid payable application.

**Primary CTA:** `Pay now`

**Alternative actions:**

- Pay later
- Return to application
- Change partner before payment

**Edge cases:**

- Payment pending, failed, cancelled, duplicated, or reversed
- Payment channel unavailable
- Session timeout
- Amount mismatch
- Manual payment bypass attempted

---

## 11. Payment Confirmation and Service Instructions

**Purpose:** Confirm payment and explain what happens next.

**Components:**

- Amount paid and receipt
- Case reference
- Partner name and contact details
- Selected staff
- Next-step instructions
- Appointment details if later supported

**Empty state:** Payment pending. Show a refresh state and do not present the service as booked.

**Primary CTA:** `View application`

**Alternative actions:**

- Download receipt
- Contact facility
- Return to dashboard

**Edge cases:**

- Payment confirmation delayed
- Receipt unavailable
- Partner contact details change
- Payment confirms after the user leaves
- Refund initiated

---

## 12. Fitness Application Details

**Purpose:** Track the application from payment through the MOH decision.

**Components:**

- Status timeline
- Staff-level results
- Facility details
- Payment receipt
- Next required action
- Messages
- Decision summary

**Empty state:** No result has been submitted. Show `Awaiting facility result` and the facility's contact details.

**Primary CTA:** `Complete required action`

**Alternative actions:**

- Contact facility
- Download receipt
- Withdraw an unresolved person where permitted
- View decision

**Edge cases:**

- Partial results submitted
- A `Refer` result blocks issuance
- `Not Fit` is shown without a medical reason
- Facility corrects a submitted result
- MOH removes one person with a recorded reason
- MOH decision is delayed

---

## 13. Fitness Certificate Details

**Purpose:** Show the issued certificate and each covered person's validity.

**Components:**

- Certificate number
- Covered people
- Issue and expiry dates
- Certificate status
- Issuing council
- Barcode or verification code
- Download action

**Empty state:** No certificate was issued. Return the user to the application decision.

**Primary CTA:** `Download certificate`

**Alternative actions:**

- Verify certificate
- Start renewal
- View application
- Add a newly hired staff member through a new application

**Edge cases:**

- One person is revoked while others remain valid
- Certificate expires, is suspended, or is revoked
- Reprint must use the original settings
- Download fails

---

# C. Fumigation Certificate

## 14. Start Fumigation Application

**Purpose:** Confirm the premises and service period before choosing a provider.

**Components:**

- Premises summary
- Business type
- Contact details
- Requested period
- Configurable documents
- Required declarations

**Empty state:** Incomplete premises profile. Show the missing fields and block submission.

**Primary CTA:** `Choose provider`

**Alternative actions:**

- Save draft
- Update premises details
- Cancel

**Edge cases:**

- Existing active application
- Valid certificate is not yet renewable
- Unsupported premises type
- Missing document
- Application is attached to the wrong premises

---

## 15. Choose Licensed Provider

**Purpose:** Allow the business to compare currently licensed pest-control providers.

**Components:**

- Provider name and registration number
- Location
- Services
- Approved price
- Availability, if supplied
- Contact details
- Filters

**Empty state:** No licensed provider is available. Save the draft and explain that payment cannot proceed.

**Primary CTA:** `Select provider`

**Alternative actions:**

- View provider details
- Change filters
- Go back
- Save draft

**Edge cases:**

- Provider's licence expires
- Provider is suspended
- Selected service becomes unavailable
- Price changes before selection
- Provider cannot serve the premises location

---

## 16. Review Fumigation Application

**Purpose:** Confirm the premises, provider, service, and price before payment.

**Components:**

- Premises
- Provider
- Service scope
- Requested period
- One total price
- Declarations
- Editable sections

**Empty state:** Not applicable once the application draft is complete.

**Primary CTA:** `Proceed to payment`

**Alternative actions:**

- Change provider
- Edit application
- Save and exit
- Cancel application

**Edge cases:**

- Provider or price becomes invalid
- Premises information changes
- Duplicate request
- Required document expires before payment

---

## 17. Fumigation Application Details

**Purpose:** Track the service, partner report, EHO confirmation, and MOH decision.

**Components:**

- Status timeline
- Provider and contact details
- Payment receipt
- Service date
- Partner report status
- EHO confirmation status
- Next required action
- Decision

**Empty state:** No report has been submitted. Show `Awaiting provider report` and the provider's contact details.

**Primary CTA:** `Complete required action`

**Alternative actions:**

- Contact provider
- Download receipt
- View decision
- Report a scheduling issue

**Edge cases:**

- Service date changes
- Provider report is missing or disputed
- Supervising EHO is not recorded
- Provider corrects the report
- MOH review is delayed
- Refund or cancellation rule applies

---

## 18. Fumigation Certificate Details

**Purpose:** Show the issued premises certificate and its current validity.

**Components:**

- Certificate number
- Premises
- Provider and registration number
- Work, issue, and expiry dates
- Supervising office
- Certificate status
- Barcode
- Download action

**Empty state:** No certificate was issued. Return the user to the application decision.

**Primary CTA:** `Download certificate`

**Alternative actions:**

- Verify certificate
- Start renewal
- View fumigation history
- View application

**Edge cases:**

- Certificate withdrawn because pests returned
- Withdrawal is backdated
- Certificate expires, is suspended, or is revoked
- New certificate overlaps an existing certificate
- Download fails

---

# D. Health Approval and Inspection

## 19. Health Approval Details

**Purpose:** Explain Health Approval eligibility and track the inspection-led decision without offering an application action.

**Components:**

- Eligibility checklist
- Fitness and Fumigation Certificate status
- Missing conditions
- Inspection status
- Outstanding contraventions
- Decision
- Health Approval Certificate when issued

**Empty state:** The business is not eligible. Show exactly what is missing and link to the relevant task.

**Primary CTA:** `Complete missing requirement`

**Alternative actions:**

- View inspection notice
- View findings
- View decision
- Download Health Approval after issuance

**Edge cases:**

- Underlying certificate expires or is revoked
- Health Approval becomes `At Risk`
- Health Approval must not be automatically suspended
- Approval issued with conditions
- Approval refused, suspended, or revoked
- Council adds another eligibility condition

---

## 20. Inspection Notice Details

**Purpose:** Show the inspection notice and capture the business's acknowledgement before the inspection occurs.

**Components:**

- Inspection type
- Premises
- Scheduled date and time
- Issuing council
- Notice reference and barcode
- Delivery channel and time
- Acknowledgement status
- Inspection preparation instructions

**Empty state:** No active inspection notice.

**Primary CTA:** `Acknowledge notice`

**Alternative actions:**

- Download notice
- Contact the council
- Return to Health Approval details

**Edge cases:**

- Notice delivered through another channel
- Notice not acknowledged within the configured period
- Duplicate acknowledgement
- Notice is replaced or cancelled
- Follow-up inspection receives a separate notice
- Legal validity of email and SMS service remains unresolved

---

## 21. Inspection Findings and Corrective Actions

**Purpose:** Explain the inspection outcome, each contravention, what must be corrected, and the deadline.

**Components:**

- Inspection date and type
- Overall outcome
- Findings notice
- Contravention list
- Required corrective action for each item
- Resolution deadline
- Status of each item
- Follow-up inspection date when scheduled
- Optional remediation evidence upload if approved

**Empty state:** No contraventions were recorded. Show that no corrective action is currently required.

**Primary CTA:** `View required actions`

**Alternative actions:**

- Download findings notice
- Upload remediation evidence if supported
- Contact the council
- Object to a finding

**Edge cases:**

- Several contraventions have different deadlines
- Deadline passes before the business acts
- Evidence upload fails or is rejected
- Uploaded evidence does not close the contravention automatically
- Finding affects an existing Fitness, Fumigation, or Health Approval Certificate
- Legal objection process remains unresolved

---

## 22. Follow-up Inspection Details

**Purpose:** Track the follow-up inspection created for unresolved contraventions and show its outcome.

**Components:**

- Original inspection reference
- Outstanding contraventions
- Corrective-action deadline
- Follow-up notice and acknowledgement status
- Follow-up inspection date
- Updated finding for each contravention
- Resolution or escalation outcome
- MOH decision where required

**Empty state:** No follow-up inspection is required because there are no outstanding contraventions.

**Primary CTA:** `Acknowledge follow-up notice`

**Alternative actions:**

- View original findings
- Download follow-up notice
- View submitted evidence
- Contact the council
- View final decision

**Edge cases:**

- Follow-up notice is not acknowledged
- Follow-up inspection is rescheduled or cancelled
- Some contraventions are resolved while others remain open
- New contraventions are discovered
- Follow-up results in refusal, withdrawal, suspension, or revocation
- Further action must be decided by the authorised officer, not automatically by the system

## Business-side Inspection Flow

**Inspection scheduled → Notice received → Notice acknowledged → Inspection completed → Findings notice issued → Business corrects issues → Follow-up notice received → Follow-up notice acknowledged → Follow-up inspection completed → Contraventions resolved or escalated → MOH decision where required**

---

# D. Ongoing Account Use

## 23. Business Settings

**Purpose:** Let a signed-in business review account identity and save notification choices.

**Components:**

- Verified email and phone, assigned council, and business reference shown read-only
- Business profile, Account, and Notifications tabs
- Editable business and premises fields shown directly on the Business profile tab with a `Save changes` action
- Business avatar and premises photos managed on the Business profile tab
- Separate choices for application and inspection email updates
- Preferences are saved locally; email delivery is outside the current implementation

**Primary CTAs:** `Save changes` on Business profile; `Save preferences` on Notifications.

**Rules:** A completed account cannot use the onboarding contact-change action. A new email or phone requires a separate verification process. Changing council requires review of the premises assignment. In-portal notices and application status remain visible regardless of email choices.

---

# Recommended Shared Status Labels

| Flow | Internal stage | Business-facing label |
|---|---|---|
| Both certificates | Draft | Action needed |
| Both certificates | Awaiting payment | Payment required |
| Both certificates | Payment pending | Confirming payment |
| Fitness | Awaiting facility result | Assessment in progress |
| Fitness | Refer | Further assessment required |
| Fumigation | Awaiting service or report | Service in progress |
| Fumigation | Awaiting EHO confirmation | Report under review |
| Both certificates | MOH review | Decision in progress |
| Both certificates | Issued | Certificate active |
| Health Approval | Not eligible | Requirements incomplete |
| Health Approval | Eligible | Inspection pending |
| Inspection | Notice served | Acknowledgement required |
| Inspection | Findings issued | Corrective action required |
| Inspection | Follow-up scheduled | Follow-up inspection pending |
| Inspection | Contraventions resolved | Requirements satisfied |
| Inspection | Contraventions unresolved | Further action required |
| Health Approval | At risk | Action required |

# Out of Scope

- Partner submission form field specifications
- EHO checklist and field-work screens
- MOH decision and certificate issuance controls
- Admin, finance, reporting, and staff settings screens
- Public certificate verification
- Final legal objection and appeal procedure
