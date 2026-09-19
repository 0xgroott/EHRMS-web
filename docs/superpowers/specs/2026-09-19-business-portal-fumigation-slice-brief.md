---
title: "Fumigation Certificate slice 3 — design/build brief"
---

# Fumigation Certificate slice 3 — design/build brief

## Outcome

A business user starts from the registered premises, requests a fumigation period, selects a licensed provider, reviews one service price, confirms a simulated payment, tracks the provider report, EHO confirmation, and council decision, then views an issued Fumigation Certificate. The certificate remains in the browser for that business profile.

## Design direction

Audience: business owners and premises managers completing compliance tasks. The interface should feel clear, calm, and official, matching the existing light business shell and teal accents. Use a compact application stepper, readable provider comparisons, an ordered decision timeline, and a document-like certificate. Product labels read as they would in the intended service. A disclosure beside payment and a separate, clearly named simulation area explain that no money moves and no external authority acts; the certificate view states that it is not an official document.

## State contract

One profile-scoped `FumigationState` holds one `FumigationApplication` and its certificate. Stages are `draft`, `review`, `awaiting-provider`, `report-submitted`, `eho-confirmed`, and `issued`. The application records requested period, declaration, selected provider, total NGN, payment reference, work date, and certificate. Pure transitions enforce the order. Invalid or missing period/declaration blocks provider selection. Provider, EHO, and council transitions are separate from business actions.

## Screens and integration

- Start, provider selection, review, and payment use a focused `/business/fumigation/apply` flow.
- `/business/fumigation/tracker` shows payment confirmation, provider/service/report, EHO confirmation, council decision, and the separate simulation controls.
- `/business/fumigation/certificate` shows certificate number, premises, provider registration, work/issue/expiry dates, supervising office, and application link.
- Dashboard, Applications, and Certificates link to the correct stage. Health Approval and inspection actions remain later-workflow placeholders.
- Existing Fitness headings, status labels, and certificate links lose repetitive “demo” language while keeping one relevant disclosure at simulated payment/external action and certificate view.

## Verification

Test transition guards, profile persistence, the main browser journey, and mobile layout. Run lint, formatting check, typecheck, tests, and build. No backend, Clerk, real payment, push, or merge.
