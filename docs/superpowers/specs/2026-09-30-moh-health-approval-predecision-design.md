# MOH Health Approval Pre-Decision Flow Design

## Goal

Give each MOH page one clear responsibility while preserving the implemented decision and inspection experiences: Health Approvals for completed EHO submissions, Inspections for eligible and scheduled businesses, and Businesses for the council register.

## Scope

- Rename the existing decision dashboard to `Health approvals`.
- Rename the pre-decision Health Approval worklist to `Inspections` and remove its duplicated decision tab.
- Use `Awaiting assignment` and `Scheduled & in progress` inspection tabs.
- Let the MOH open an eligible premises and confirm its Fitness, Fumigation, council-condition, existing-approval, and inspection-history position.
- Let the MOH assign an EHO and choose an inspection date from the eligibility detail screen.
- Show scheduled and in-progress inspections in a tracking view.
- Keep completed EHO submissions and their approve/deny review under Health Approvals.
- Add a council-scoped `Businesses` directory showing business type, ward, current journey stage, and simplified status.
- Persist scheduled inspection state under the assigned MOH account only.

## Reuse Decisions

- Reuse the MOH shell, header, sidebar, page header, and account-scoped session provider.
- Reuse the shared scrollable tabs, table, badges, cards, fields, dialog, select, input, empty state, and premises-avatar presentation.
- Adapt the Business portal eligibility checklist and inspection-stage language.
- Adapt the EHO inspection progress stepper and scheduling-dialog pattern.
- Keep MOH workflow state separate from Business and EHO browser storage so account and role boundaries remain intact.

## Routes

- `/moh/health-approvals` — completed inspections awaiting or recording an MOH decision.
- `/moh/health-approvals/$businessId` — final decision review.
- `/moh/inspections` — eligible, scheduled, and in-progress approval inspections.
- `/moh/inspections/$caseId` — eligibility or inspection detail according to the case stage.
- `/moh/businesses` — registered businesses for the MOH's council.
- `/moh/home` — compatibility redirect to Health Approvals.

## Data and Behaviour

The inspection worklist uses fictional Port Harcourt premises. Cases shown there have either an `eligible` or `inspection` stage. Scheduling requires an EHO and a valid present-or-future date. A successful schedule records the officer, visit date, notice reference, and timestamp, then moves the case into `inspection`. Invalid or malformed persisted data falls back to the seed state.

Decision-ready rows remain in the existing MOH submission queue under Health Approvals. They no longer appear in the Inspections page.

The Businesses directory reuses the shared premises register and presents five simplified statuses: `Compliant`, `Pending`, `Non-compliant`, `Expiring soon`, and `Suspended`. `Pending` is used for an unfinished journey; `Non-compliant` is reserved for an actual compliance problem or corrective action.

## Responsive Behaviour

Desktop uses the existing table pattern. Mobile uses stacked case cards so the page never relies on a wide table. Tabs use the shared horizontally scrollable, vertically clipped tab strip.

## Testing

- Pure tests cover seeded stages, filtering, sorting, validation, and scheduling transitions.
- Component tests cover the distinct navigation, two inspection tabs, eligibility evidence, scheduling validation, inspection tracking, and the Businesses directory.
- A focused Playwright flow signs in, verifies Health Approvals, schedules an eligible premises from Inspections, opens a decision-ready business, and visits Businesses at desktop and 390px.
