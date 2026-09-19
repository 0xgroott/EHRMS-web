# Business Portal Slice 2 — Food Handlers and Fitness Demo

## Purpose and source

Deliver one end-to-end, frontend-only demonstration: register food handlers, apply for a Fitness Certificate, simulate payment and external assessment, and view an issued demo certificate. Follow `docs/Business_User_End_to_End_UX_Flow_Map.md` and `docs/Business Portal - UX Flow Screen Specifications.md`. Reuse Slice 1 business shell, profile, form components, and seeded-session boundary.

## Confirmed decisions

- Finish with a simulated issued Fitness Certificate, not merely an application awaiting results.
- Keep assessment and council issuance separate from business actions. Clearly labelled demo controls advance those external steps.
- Optimize for the main journey and one useful validation state. No production backend, payment provider, facility integration, or Clerk integration in this slice.
- One business account, one premises, one active Fitness application in the demo.
- Do not change the ongoing first-person article as part of this work.

## Demonstration journey

1. **Food handlers:** Replace the existing Slice 2 placeholder with an empty state, staff list, and `Add food handler` action. Saved records show name, role, readiness, and Fitness coverage. Edit a saved record.
2. **Add or edit handler:** Capture full name, sex, date of birth, job/role, identity number, phone, workplace (current premises), and consent. Save returns to the list; `Save and add another` clears the form. At minimum, require identity, role, contact, and consent before application selection. Show inline errors without losing entered values.
3. **Start application:** Select one or more eligible active handlers for the current premises. Show selection count and missing-data reasons. If none qualify, direct the user back to staff records. Changing selection does not edit handler records.
4. **Choose facility:** Show a small seeded set of approved facilities with location, service, contact details, and one approved total price. User selects one. No live availability or scheduling; coordination happens through the facility contact after payment.
5. **Review:** Show premises, selected people, facility, service total, and clear `Proceed to demo payment` action. Allow back navigation to change selection or facility.
6. **Demo payment:** Explain that no money moves. One confirmation advances the application to paid status, creates a clearly marked demo reference/receipt summary, and opens tracking. Payment alone never issues a certificate.
7. **Application tracking:** Show current status, owner of the next step, selected handlers, facility contact, payment summary, and a short timeline. Start at `Awaiting facility result`.
8. **External-step simulation:** A visually separate panel labelled `Demo controls — simulated external actions` advances first to `Facility result received: Fit` for all selected handlers, then to `Council decision: issued`. Business user does not appear to submit facility results or approve its own certificate. No medical details shown.
9. **Certificate details:** Show clearly marked demo certificate number, covered handlers, premises, issuing council, issue/expiry dates, and status. Link back to application. Do not offer an official download or public verification claim.

## Navigation and dashboard

- Existing `Food handlers`, `Applications`, and `Certificates` destinations become functional for this journey. Fumigation remains an upcoming-slice state within Applications and Certificates.
- Dashboard next action updates from `Add your food handlers` to `Start Fitness application`, then `Track Fitness application`, then the next relevant Fumigation action after issuance. Fitness status card reflects actual demo state.
- Every visible action reaches a real screen or clearly labelled placeholder. No dead routes.

## State and prototype boundary

- Store handler records and one Fitness application in a small feature-scoped browser state associated with the current business profile. Use local persistence only to keep the demo repeatable after reload. Reuse existing session and profile; do not build another session/cache framework.
- Keep seeded facilities deterministic. Store only chosen facility ID, selected handler IDs, payment status/reference, external-step status, and issued demo certificate summary. No real payment details or private medical data.
- Preserve application state during back navigation and reload. Prevent the few invalid transitions that would break the demo: empty/ineligible staff selection, payment before review, and certificate issuance before simulated result. Do not add broad corruption, concurrency, or network-retry machinery.

## Visual and accessibility baseline

- Reuse the compact business shell and shadcn component language. Clear headings, labels, statuses, and one primary action per step.
- Desktop and mobile layouts must remain usable, including 390-pixel width and keyboard navigation. Show validation beside affected fields and explain blocked next steps in plain language.
- Distinguish real business actions from demo-only external actions through copy and visual grouping.

## Verification standard

- Focused tests for handler eligibility, application transitions, and dashboard next-action priority.
- One browser walkthrough covering handler creation through issued demo certificate, plus one blocked/invalid handler case.
- Run lint, formatting, typecheck, build, and the relevant existing tests. Avoid exhaustive component-by-component tests and production-only edge cases for this frontend prototype.

## Deferred

- Real authentication, payment, partner submissions, council decisions, uploads, receipts, official PDF, and public certificate verification.
- Partial, Refer, and Not Fit assessment branches; privacy-sensitive reasons; renewals; multiple active applications; multiple premises.
- Search, filters, bulk selection, imports, archive history, configurable council-specific fields, scheduling, payment failure/refund, and comprehensive recovery/race hardening.
- Dedicated Emil design-engineering polish pass.

## Completion signal

From a completed Slice 1 business account, the demo can add handlers, submit an eligible group, select a facility, make a clearly simulated payment, view the waiting state, advance simulated external decisions, and see a demo issued certificate. Dashboard and business navigation reflect the result after reload.
