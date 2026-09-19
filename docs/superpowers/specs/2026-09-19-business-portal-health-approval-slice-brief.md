# Health Approval and inspection slice 4 — design/build brief

## Outcome

The business sees exactly which Fitness and Fumigation requirements remain. Once both certificates are issued, it can follow an inspection notice, acknowledge it, read a seeded findings notice, record a correction for each item, acknowledge a separate follow-up notice, and view the council's final Health Approval outcome. Health Approval has no business application form.

## Design direction

Keep the existing calm, light business portal. Present eligibility as a short checklist, inspections as dated notices with a clear acknowledgement action, and findings as a readable action list with individual deadlines. Keep business actions visually distinct from an explicitly labelled simulation section for council inspection, follow-up, and issuance. Payment and official authority are never implied by these controls. The issued outcome carries one clear non-official disclosure.

## State contract

One profile-scoped `InspectionState` stores a current case. Its ordered stages are `notice-served`, `notice-acknowledged`, `findings-issued`, `corrections-recorded`, `follow-up-served`, `follow-up-acknowledged`, `resolved`, and `approval-issued`. A council scheduling transition requires both certificate prerequisites. Business acknowledgement and correction recording are separate from council findings, follow-up, resolution, and issuance. Two seeded contraventions each require a non-empty correction note before follow-up can be scheduled. Pure transition rules reject out-of-order actions. A separate unresolved follow-up outcome is shown as `further-action`, with no automatic suspension or revocation.

## Screens and integration

- `/business/health-approval` shows prerequisites, inspection progress, decision, and the issued Health Approval summary.
- `/business/inspections` is the current notice and findings hub. It presents the original notice, corrective actions, and separate follow-up notice as the case advances.
- Dashboard and Certificates route to the next relevant action and show real Health Approval status. Existing Fitness and Fumigation records remain the prerequisites.
- No backend, real notice delivery, document download, evidence upload, objections, or automatic regulatory sanction.

## Verification

Test prerequisite and transition guards, correction validation, persistence, the main browser journey, and mobile layout. Run lint, formatting, typecheck, tests, build, and the maintained browser checks before the PR.
