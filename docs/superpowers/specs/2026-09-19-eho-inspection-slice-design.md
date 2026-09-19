---
title: "EHO Portal Slice 1 — Assigned Sign-In and Inspection Capture"
---

# EHO Portal Slice 1 — Assigned Sign-In and Inspection Capture

## Outcome and sources

An Environmental Health Officer signs in with an administrator-assigned demo account, opens assigned work, prepares for a noticed inspection, records checklist findings, saves a draft, and submits a completed inspection to a clearly labelled prototype result. The experience works on desktop, tablet, and phone.

This design follows `docs/EHO_UX_Flow_Screen_Specifications.md`, `docs/EHO_End_to_End_UX_Flow_Map.md`, `docs/Clean_Prototype_Slice_Build_Playbook.md`, and the frontend prototype build prompt. It covers the first EHO slice only. Everything runs in the frontend with seeded data and browser persistence.

## Approach and decision

Three approaches were considered:

1. Add EHO screens inside the existing staff shell. This is quick but exposes the broad staff navigation and council/role controls in a field workflow.
2. Copy the Business Portal into an EHO portal. This gives role separation but duplicates account, shell, and form code.
3. **Use a dedicated EHO portal with shared primitives and focused EHO state.** This preserves a lean field experience while reusing proven visual and interaction patterns. This is the selected approach.

## Scope

| Screen | First-slice behavior |
|---|---|
| Sign In | Email or staff ID and password; seeded assigned-account shortcut; invalid and disabled-account errors; administrator contact guidance; no registration action. |
| Home / My Work | Assigned inspections, due/follow-up indicators, notice status, and one clear next action. Fumigation jobs are shown only as a later-slice destination. |
| Inspection List | Search and Today, Upcoming, Follow-up, Completed filters; open assigned inspections and their premises. |
| Inspection Overview | Premises, schedule, assigned officers, notice and acknowledgement, previous work, and readiness. `Start inspection` is disabled until the required notice is served. |
| Premises Compliance | Read-only certificate, document, open-finding, and inspection-history summary accessible from the inspection. `Not Found` is distinct from `Non-compliant`; stale demo data is labelled. |
| Inspection Checklist | Four answers per item: Satisfactory, Contravention, Not applicable, Unable to check. Notes, optional evidence metadata, progress, local draft save, and resume. |
| Contravention Detail | Issue description, corrective action, deadline, notes, and optional evidence metadata; supports more than one issue on a checklist item. |
| Review & Submit | Checklist completion, contraventions, evidence count, attending officers, and final confirmation. Incomplete required items or incomplete contraventions block submission. |
| Submission Result | Local submitted or queued state, outcome count, and links back to My Work and the completed inspection. It does not claim that an official notice or certificate was issued. |

Findings Notice and Follow-Up Inspection are the next inspection slice. Fumigation supervision and standalone Premises Search follow as separate slices. Profile / Sync gets a minimal status and sign-out surface in this slice so navigation is complete, without promising real synchronization.

## Routes and navigation

- `/eho/sign-in` is public.
- `/eho/my-work`, `/eho/inspections`, `/eho/inspections/$inspectionId`, and nested checklist, contravention, review, and result destinations require an EHO session.
- `/eho/premises/$premisesId` opens read-only compliance information and retains a route back to the active inspection.
- `/eho/profile` shows the assigned officer, council, local draft/queue status, and sign-out.
- Top-level navigation contains only **My Work**, **Premises Search** (later-slice destination), and **Profile / Sync**. Inspection lists and details open contextually from My Work.
- Choosing the EHO demo role in the existing staff role selector goes to `/eho/sign-in`; it does not bypass assigned-account sign-in. Direct EHO URLs redirect unauthenticated users to sign-in.

## Account and prototype state

Seed one active officer assigned to a council and a small set of inspections: one ready with a served notice, one blocked because notice is unserved, one resumable draft, and one completed example. Include a disabled-account example for error feedback. No EHO signup, self-assignment, council switching, or credential creation exists.

Successful sign-in stores only the officer ID and session marker in browser storage; the password is never stored. The seeded credential is visible as a demo shortcut. Sign-out clears the EHO session and leaves local inspection drafts intact for the same officer. Returning to the portal restores a valid local demo session. First sign-in while offline is unavailable; later access to cached prototype state can be demonstrated only while the app itself is loaded. Real authentication and offline app installation are outside this slice.

Inspection assignments and premises summaries read from a dedicated EHO mock repository. Reuse the existing premises seed identities where possible, including Riverside Kitchen, without treating the Business Portal's notice/correction state as an EHO inspection record. EHO drafts and submissions are keyed by officer and inspection ID and validated on load. Form fields own temporary edits; domain rules own notice gating, checklist completion, contravention validation, and state transitions. TanStack Query provides stable reads and mutation updates. Browser storage is versioned and recovers from malformed data without a blank or broken portal.

An optional evidence control records filename, type, size, and associated item only. The prototype does not persist image bytes or imply that a photo was uploaded. The UI states this when evidence is selected.

## Reuse boundaries

- Reuse shared `Button`, `Card`, `Field`, `Input`, `Tabs`, `Sheet`, `StatusBadge`, `EmptyState`, and `PageHeader` patterns.
- Adapt the Business Portal's responsive shell, mobile navigation, sign-in layout, form error handling, and local-session hydration pattern. Extract a neutral shared component only when both portals genuinely need the same API; do not make EHO components depend on business-specific labels or registration actions.
- Reuse premises identity and read-only certificate/document display patterns. Do not reuse Business Portal `InspectionState`, which models business acknowledgement, corrections, and council outcome rather than an officer's field checklist.
- Keep the EHO route, session, and inspection components in EHO-specific modules. Do not expand the generic staff shell into the EHO field app.

## Field and failure behavior

- A notice that is missing or unserved blocks Start and explains the reason. A follow-up would need its own notice in the next slice.
- An officer can save a partial checklist and resume it after navigation or reload. Saving does not mark the inspection submitted.
- Every required checklist item needs one answer. A Contravention answer needs at least one saved issue with a corrective action and deadline. Removing the last issue returns that item to an incomplete state until it is answered again.
- Review shows attending officers separately from assigned officers; the officer can correct attendance before submission.
- Submission is idempotent in the local prototype. A repeated click cannot create a second result. An offline simulation records a queued local result; it does not claim server delivery. Profile / Sync may display that queue, but `Sync now` cannot claim success without a backend.
- Missing premises or assignment, malformed stored drafts, failed browser storage writes, and stale compliance data receive explicit, recoverable messages. Existing form entries remain visible after recoverable errors.
- Officers cannot issue, suspend, revoke, or withdraw certificates from any EHO screen.

## Accessibility and responsive design

The layout is desktop capable but prioritizes tablet and 390-pixel phone use in the field. Checklist answers and primary controls have practical touch targets, visible focus, labels, and keyboard operation. Error text is tied to its field. Status always has text as well as color. Saved, queued, and failed states use concise screen-reader announcements. The checklist keeps progress and the save action visible without trapping scrolling.

## Verification and completion criteria

Test the core journey from assigned-account sign-in through submitted result, plus draft reload/resume, notice blocking, invalid and disabled credentials, incomplete checklist, multiple contraventions, duplicate submission, sign-out and route guards, corrupted local data, and a storage failure. Browser-check the journey on desktop and 390-pixel mobile for navigation, overflow, and console errors. Run the repository's test, lint, format check, typecheck, and build gates.

The slice is complete when an officer can finish one seeded inspection, leave and resume a draft, see an accurate local result, and never reach an EHO account-creation or certificate-decision action.
