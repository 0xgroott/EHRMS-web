---
title: "EHRCMS Business Portal Slice 1 Design"
---

# EHRCMS Business Portal Slice 1 Design

## Purpose

Build the first tested Business User slice: account entry, contact verification, business and premises setup, and an action-first Business Dashboard. The slice establishes the business-facing route, state, and shell boundaries used by later Fitness, Fumigation, and inspection workflows.

## Source Documents

- `docs/Business_User_End_to_End_UX_Flow_Map.md`
- `docs/Business Portal - UX Flow Screen Specifications.md`
- `docs/superpowers/specs/2026-09-18-ehrcms-frontend-foundation-design.md`

## Delivery Strategy

The complete Business Portal will be delivered as four tested slices:

1. Account setup and Business Dashboard
2. Food handlers and Fitness Certificate
3. Fumigation Certificate
4. Health Approval, inspections, and corrective actions

This design covers Slice 1 only.

## Confirmed Product Decisions

- Use a branded split layout for Sign In and onboarding. The brand panel collapses on small screens.
- Provide both Create Account and a simple Sign In screen.
- Use the visible demo OTP `123456`.
- One business account manages one premises in this version.
- Use an action-first Business Dashboard.
- Use a compact business-facing sidebar rather than the full staff navigation.
- Save account, verification, premises, and onboarding progress in browser storage.
- Switching the demo role to `Business User` opens the Business Dashboard.
- Existing staff and administrative routes remain unchanged.

## Routes

| Route | Access | Purpose |
|---|---|---|
| `/business/sign-in` | Public | Returning business entry with a seeded demo-account shortcut |
| `/business/register` | Public | Create a business user account |
| `/business/verify` | Registration session | Verify the chosen phone number or email |
| `/business/setup` | Verified registration | Register the business and its single premises |
| `/business/dashboard` | Business session | Show compliance state and the next required action |

Later Business Portal destinations use purposeful placeholder screens until their delivery slice. No visible action may lead to a dead route.

## Interface Structure

### Public Entry and Onboarding

The desktop layout has a teal brand panel and a focused form panel. The brand panel explains the portal's value without marketing noise. On mobile, the form becomes the primary full-width surface and retains a compact EHRCMS identity.

The onboarding journey shows clear progress:

1. Account
2. Verify contact
3. Business and premises

Each screen has one primary action. Secondary actions use links or quiet buttons.

### Business Portal Shell

The authenticated Business Portal uses a compact sidebar with:

- Home
- Food handlers
- Applications
- Certificates
- Inspections
- Business profile

Desktop uses a persistent sidebar. Mobile uses a slide-out menu. The header shows the registered business name, notifications, and the business account menu. Staff-only council and role controls are not shown inside the business shell.

### Action-First Dashboard

Dashboard priority order:

1. Urgent inspection or corrective-action alert, when present
2. One dominant `Next required action`
3. Fitness, Fumigation, and Health Approval status cards
4. Active applications
5. Expiry and deadline reminders
6. Recent receipts and certificates

For the initial seeded state, the next action is `Add your food handlers`. It opens a clear Slice 2 placeholder until the Food Handlers workflow is delivered.

## Screen Behavior

### Sign In

- Accept email or phone plus password.
- Offer a seeded demo business shortcut.
- Successful demo sign-in creates a business session and opens `/business/dashboard`.
- Invalid credentials show an inline error without clearing the form.
- `Create account` opens `/business/register`.

### Create Account

- Capture business name, contact name, phone, email, password, and terms/privacy consent.
- Validate required fields, email and phone shape, password strength, and consent.
- Simulate an existing email or phone error with deterministic demo values.
- Successful submission saves a registration draft and opens `/business/verify`.
- `Sign in` opens `/business/sign-in`.

### Verify Contact

- Show the masked verification destination.
- Accept only the demo code `123456`.
- Support incorrect code, expired code, resend countdown, resend-limit, and contact editing states.
- Successful verification updates the registration draft and opens `/business/setup`.
- Resend resets the countdown without calling an external service.

### Business and Premises Setup

Organize the form into visible sections:

- Business details
- Registration details
- Premises details and address
- Council and contact details
- Configurable supporting documents

The form autosaves after changes and displays `Saving…`, then `Saved`. Demo uploads retain filename, size, and category metadata only. Save and continue requires all configured mandatory fields. Save draft and exit keeps partial progress.

### Business Dashboard

- Read the current business, premises, application, certificate, inspection, receipt, and reminder state.
- Derive one next required action from that state.
- Never offer a direct Health Approval application.
- Use the shared business-facing status labels from the source specification.
- Preserve the distinction between `Not Found` and `Non-compliant` where premises compliance appears.

## State and Data Boundaries

Add a versioned business prototype state separate from the existing staff mock database. It contains:

- Business account profile
- Registration and verification state
- Single business and premises profile
- Onboarding completion state
- Food-handler summary placeholder
- Application summaries
- Certificate summaries
- Inspection and corrective-action alerts
- Receipts and reminders

The storage adapter accepts a `Storage` dependency, validates its schema version, falls back to seeded data when malformed, and never reads `window` during server rendering. TanStack Query exposes stable query keys and invalidates affected dashboard data after mutations.

Form components own temporary field state. Domain services own validation, persistence, and next-action derivation. Routes coordinate navigation only.

## Error and Edge States

- Existing account contact
- Invalid or unreachable contact format
- Weak password or missing consent
- Incorrect, expired, or rate-limited OTP
- Duplicate premises
- Unsupported council or LGA
- Missing mandatory document
- Invalid file type or failed demo upload
- Interrupted autosave and retry
- Malformed or old browser storage
- Incomplete profile on dashboard
- No active applications, receipts, certificates, inspections, or alerts
- Several urgent tasks, reduced to one primary next action plus visible secondary alerts

Errors stay near the affected field or action. User-entered values remain available after recoverable failures.

## Accessibility and Responsive Behavior

- Use semantic labels, field descriptions, error associations, and live regions for save and verification feedback.
- Support keyboard navigation and visible focus states.
- Maintain WCAG AA contrast with the existing teal-based design tokens.
- Use touch targets of at least 44 by 44 CSS pixels on mobile.
- Collapse the onboarding brand panel and Business Portal sidebar without hiding required actions.
- Avoid color-only status communication.

## Testing Strategy

### Unit and Component Tests

- Account and premises validation
- OTP success, failure, expiry, and resend behavior
- Versioned storage fallback and persistence
- Next-required-action derivation
- Business navigation visibility
- Business role redirect behavior
- Dashboard empty and urgent-action states

### Browser Tests

- Create Account → Verify Contact → Setup → Dashboard
- Save draft, refresh, and resume
- Seeded Sign In → Dashboard
- Business role entry from the existing demo control
- Invalid form and OTP recovery
- Desktop and mobile navigation
- No console errors across Slice 1 routes

### Required Gates

- ESLint
- Prettier check
- Vitest
- TypeScript typecheck
- Production build

## Out of Scope

- Real authentication, password recovery, SMS, or email delivery
- Real file transfer or document scanning
- Multiple premises per account
- Food-handler management and Fitness applications beyond purposeful placeholders
- Fumigation applications
- Health Approval decisions
- Inspection acknowledgement and corrective-action workflows
- External payment integration
- Public certificate verification
- Partner, EHO, MOH, finance, or administrative workflows

## Success Criteria

- A first-time user can complete the full simulated onboarding journey without hidden knowledge beyond the visibly supplied demo OTP.
- A returning user can enter with the seeded demo account.
- Refreshing the browser preserves safe prototype progress.
- Business users see a focused shell and one clear next action.
- Existing staff screens and permissions continue to work.
- Every visible action has a functional destination or an explicit upcoming-slice screen.
- All required quality gates and browser flows pass.
