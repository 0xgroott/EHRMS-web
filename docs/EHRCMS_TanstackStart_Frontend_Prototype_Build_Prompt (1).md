---
title: "EHRCMS Frontend Prototype Build Prompt"
---

# EHRCMS Frontend Prototype Build Prompt

You are helping me build a frontend-only clickable prototype for a product called **EHRCMS — Environmental Health Regulatory Case Management System**.

I will provide:
1. A product concept / thesis document
2. UX flow and screen specification documents
3. UI reference screenshots
4. A Shadcn-based starter/template project that you must work inside

Your job is to inspect the existing project first, understand its structure and conventions, then build the prototype using the existing codebase.

---

# 1. Prototype Scope

This is a **frontend-only clickable prototype**.

Do NOT build:
- Backend APIs
- Database integrations
- Real authentication backend
- Real payment integrations
- Email/SMS integrations
- Real file storage
- Server-side business logic

Use realistic mock data and frontend state to simulate the product.

The prototype should feel functional:
- Buttons should work
- Navigation should work
- Forms should be interactive
- Tables should support relevant search/filter/sort behavior
- Multi-step flows should work
- Status changes can be simulated
- Modals, drawers, dropdowns and tabs should work
- Draft applications should be saveable and resumable
- Important user actions should produce realistic UI feedback

Do not leave major CTAs non-functional unless there is genuinely nowhere for them to go.

---

# 2. Required Frontend Stack

Use:

- **TanStack Start**
- **TanStack Router**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **shadcn blocks**
- **TanStack Query**
- **TanStack Table**
- **TanStack Form**

Do not introduce a separate global state-management library such as Zustand unless there is a clear architectural need that cannot be handled cleanly by the existing stack.

Use:

- **TanStack Router** for typed routing, nested layouts, route params, and URL/search-param state
- **TanStack Query** for mock application/server state
- **TanStack Table** for operational tables
- **TanStack Form** for forms
- **React local state** for temporary UI state
- **React Context** only for small app-wide concerns such as the current demo role or selected council
- **TanStack Router search params** for filters, tabs, pagination, council scope, and other shareable view state where appropriate

---

# 3. Draft Persistence

The product includes flows where users can start work, save it, leave, and return later.

Examples:
- Business application forms
- Inspection drafts
- Configuration drafts
- Other multi-step workflows

For the prototype:

- Model drafts as real records in the mock data layer
- `Save draft` should update the mock record
- Returning to a flow should reload the saved draft
- Draft status should be visible in the UI
- Where useful, use `localStorage` so saved work survives a page refresh
- Keep persistence logic out of presentation components

Do not use a global state store just to simulate saved forms.

---

# 4. Shadcn Usage

Use the provided Shadcn preset:

`--preset b7BYPilTE`

Prefer **Shadcn blocks first** when they provide an appropriate foundation for a major UI pattern.

Use Shadcn blocks for things like:

- SaaS dashboard shells
- Sidebars
- Authentication layouts
- Data-heavy pages
- Settings layouts
- Forms
- Table views
- Cards
- Detail pages
- Dialogs
- Sheets
- Command/search interfaces

If a suitable block exists, adapt it rather than recreating the same pattern from scratch.

Use individual **shadcn/ui components** where:
- a block is not appropriate
- the pattern is smaller
- a custom layout is needed

Do not force-fit a block if it makes the UX worse.

The goal is consistency and speed, not blind reuse.

**Important:** Do not override the Shadcn preset or replace suitable Shadcn blocks just to imitate the reference screenshots. The screenshots are for visual direction only. Preserve Shadcn structure and tokens where practical, and achieve the desired look through configuration, composition, spacing, and restrained styling adjustments.

---

# 5. Start by Inspecting the Existing Project

Before writing code, inspect:

- TanStack Start project structure and routing setup
- Existing Shadcn setup
- Existing installed Shadcn blocks
- Tailwind configuration
- Design tokens
- Typography
- Existing layouts
- Existing components
- Existing icons
- Existing dependencies
- Folder structure
- Existing responsive behavior
- Existing theme support
- Existing reusable patterns

Do not unnecessarily install duplicate libraries.

Do not replace the provided template.

Extend it.

If the starter contains Next.js-specific code or assumptions, adapt those parts to TanStack Start rather than introducing Next.js into the project.

---

# 6. Product Overview

EHRCMS digitizes environmental-health regulation and certificate management.

It connects:

- Businesses
- Environmental Health Officers
- Medical Officers of Health / Directors
- Administrators
- Super Admins
- Finance Officers
- Approved medical facilities
- Licensed fumigation providers
- Supervisory authorities
- Public certificate verification

The system manages:

- Business and premises registration
- Food handlers
- Fitness Certificates
- Fumigation Certificates
- Health Approval Certificates
- Inspections
- Inspection notices
- Findings and contraventions
- Follow-up inspections
- Payments and receipts
- Facilities and providers
- Certificate status
- Reports
- Users and roles
- Settings
- Audit history

The central concept is the **premises record**.

A premises should bring together:

- Health Approval
- Fumigation Certificate
- Food-handler Fitness Certificates
- Applications
- Supporting documents
- Inspection history
- Outstanding contraventions
- Payments
- Status history
- Regulatory activity

---

# 7. Prototype Goal

The product should look and behave like a clean professional **SaaS dashboard with a persistent sidebar**.

It should feel like serious operational software.

Priorities:

- Clear information hierarchy
- Compact but readable layouts
- Strong table/list UX
- Clear status chips
- Search and filters
- Obvious primary actions
- Simple forms
- Good detail pages
- Activity/history timelines
- Strong empty states
- Useful warning states
- Minimal visual clutter
- Consistent interaction patterns

Avoid:

- Excessively large cards
- Excessive gradients
- Overly rounded playful UI
- Decorative illustrations inside operational screens
- Unnecessary animations
- Marketing-site layouts inside the product
- Deep or unnecessary navigation
- Reinventing components that already exist in Shadcn

---

# 8. Visual Direction from Reference Screenshots

The screenshots I provide may come from completely different products.

They are **visual references only**.

Do NOT:
- copy their product structure
- copy their navigation labels
- copy their data
- infer EHRCMS functionality from them
- reproduce their layouts 1:1 where that conflicts with the EHRCMS UX specifications

Use them to understand the visual character I want for EHRCMS.

The design-system foundation remains the provided Shadcn preset:

`--preset b7BYPilTE`

The screenshots should only guide visual tuning.

## Overall Feel

The interface should feel:

- Calm
- Clean
- Lightweight
- Professional
- Modern
- Highly usable
- Approachable without feeling playful
- Spacious without wasting screen space
- Suitable for serious operational/regulatory work

Avoid making EHRCMS feel like traditional heavy government software.

It should feel closer to a polished modern SaaS product.

## Layout

Prefer:

- Persistent left sidebar for primary navigation
- Large, clean content canvas
- Clear separation between navigation and workspace
- Generous page margins
- Content grouped into obvious sections
- Wide desktop layouts that make good use of horizontal space
- Simple 1-column and 2-column page compositions
- Right-side secondary panels only when they provide useful supporting context

Do not fill every part of the screen.

Whitespace is an intentional part of the visual hierarchy.

## Sidebar

The sidebar should feel lightweight rather than heavy.

Use:

- Compact navigation rows
- Small icons
- Simple text labels
- Subtle active states
- Clear grouping of related navigation
- Small section labels where useful
- User/account area anchored near the bottom
- Primary action near the top only where the role genuinely needs one

Avoid:

- Large icons
- Thick borders
- Strong background colors
- Deeply nested menus
- Too many navigation levels

Active navigation should usually be communicated through a subtle tinted background, stronger text, or both.

## Page Hierarchy

Each major page should have a clear hierarchy:

1. Page title
2. Short contextual subtitle where useful
3. Primary action
4. Filters/tabs/context controls
5. Main content

Keep headings direct and relatively compact.

Do not create oversized hero-like headings inside the application.

## Surfaces and Cards

Use cards selectively.

Cards should:

- Have subtle borders
- Use very light background differentiation
- Have modest corner radii
- Use little or no shadow
- Feel integrated into the page rather than floating above it

Prefer borders and spacing over heavy shadows.

Do not put every metric or section inside an isolated card.

Use large grouped surfaces when multiple pieces of information belong together.

## Radius

Use a restrained medium radius.

The interface should not feel overly soft or toy-like.

Buttons, inputs, cards and tables should share a consistent radius system derived from the Shadcn preset.

Avoid excessive pill shapes except for:
- status badges
- compact segmented controls
- tags
- small filter chips

## Typography

Typography should be:

- Clean
- Neutral
- Highly readable
- Slightly compact
- Strongly hierarchical

Prefer:

- Medium/semi-bold page headings
- Regular-weight body text
- Muted secondary information
- Smaller metadata text
- Strong numeric values where needed

Do not overuse bold text.

Use contrast and spacing to create hierarchy rather than font weight alone.

## Color

Keep the core UI mostly neutral.

Use:

- White/off-white surfaces
- Very light neutral page backgrounds
- Dark neutral text
- Subtle grey borders
- One restrained primary/accent color

Use accent color mainly for:

- Primary CTAs
- Selected states
- Progress
- Important positive indicators
- Small navigation accents

Operational statuses may use semantic colors, but keep them muted.

Avoid highly saturated dashboards.

## Buttons

Primary buttons should be obvious but not visually aggressive.

Prefer:

- Medium height
- Clear text labels
- Small icon when useful
- Moderate radius
- Solid primary treatment for the main action
- Outline/ghost treatment for secondary actions

Each page should generally have one visually dominant action.

Do not place several equally strong buttons beside one another.

## Forms

Form layouts should feel simple and focused.

Prefer:

- Strong labels above inputs
- Generous vertical spacing
- Straightforward helper text
- Inline validation
- Clear grouped sections
- Comfortable field widths
- Simple review steps before significant submissions

For focused flows such as:
- onboarding
- registration
- certificate applications
- decision confirmation

it is acceptable to reduce or remove the main sidebar and use a centred, distraction-free form layout.

## Option Selection

When a user must choose between a small number of meaningful options, prefer large selectable rows/cards instead of a basic dropdown.

Selected options should use:

- Subtle border emphasis
- Light accent tint if appropriate
- Clear selected state

Do not overdecorate these options.

## Tables and Data-Dense Screens

EHRCMS will contain significantly more operational data than many of the visual references.

Preserve the same clean visual language while increasing density appropriately.

Tables should:

- Sit naturally within the content area
- Use subtle row separators
- Avoid excessive borders around every cell
- Keep row heights reasonably compact
- Place status badges close to the relevant record
- Keep important actions easy to discover
- Use contextual row menus for secondary actions
- Use sticky headers where useful
- Support filters/search above the table

Prefer readable density over oversized rows.

## Dashboard Composition

Dashboards should not become walls of KPI cards.

Prefer a hierarchy such as:

- Small summary strip or compact metrics
- Priority work / actions requiring attention
- Operational lists
- Supporting information

The dashboard should answer:

- What needs my attention?
- What changed?
- What should I do next?

Metrics are secondary to actionable work.

## Tabs and Segmented Navigation

Use horizontal tabs for closely related views within the same module.

Examples:

- Overview / History
- Pending / Completed
- Applications / Certificates
- Current / Expired

Tabs should be compact, with subtle active indicators.

Do not use tabs as a replacement for the main sidebar.

## Empty States

Empty states should be useful and restrained.

Use:

- Short explanation
- One clear action where appropriate
- Minimal visual treatment

Avoid large illustrations unless there is a strong reason.

## Progressive Disclosure

Keep screens simple initially.

Secondary information should appear through:

- Tabs
- Sheets
- Dialogs
- Expandable sections
- Contextual detail panels

Do not expose every possible action or data point at once.

## Detail Pages

Record-detail pages should feel structured rather than card-heavy.

Use:

- Header with record identity/status/actions
- Summary information near the top
- Logical sections below
- Tabs where the record has substantial history
- Timelines for activity/history
- Key/value rows for metadata
- Side panel only when there is genuinely useful secondary context

This is especially important for:

- Premises
- Applications
- Certificates
- Inspections
- Providers/facilities
- Payments

## Interaction Style

Interactions should feel quiet.

Prefer:

- Immediate feedback
- Subtle hover states
- Small transitions
- Toasts for success
- Inline loading indicators
- Skeletons where useful
- Confirmation dialogs for destructive/high-risk actions

Avoid elaborate animations.

## Density Rule

The reference screenshots are intentionally spacious.

EHRCMS should adopt their visual cleanliness but **not blindly copy their low information density**.

EHRCMS is operational software, so increase information density where required while preserving:

- whitespace
- hierarchy
- subtle borders
- compact controls
- restrained color
- clear grouping

Think: **clean SaaS, not sparse marketing UI.**

## Shadcn Implementation Rule

Use the provided Shadcn preset:

`--preset b7BYPilTE`

Prefer Shadcn **blocks** when an existing block closely matches the required structure.

Good candidates include:

- sidebar shells
- authentication layouts
- dashboards
- data-table layouts
- settings layouts
- form layouts
- account/profile layouts

Then adapt those blocks to the EHRCMS product requirements and these visual rules.

Do not rebuild a generic SaaS layout from scratch if an appropriate Shadcn block already exists.

Use individual shadcn/ui components for product-specific compositions where a block is not suitable.

**The visual references must never take precedence over a suitable Shadcn block, the Shadcn preset, or the EHRCMS UX specification.**

---

# 9. Shared App Shell

Build a reusable application shell.

## Sidebar

Primary navigation should support:

- Dashboard
- Applications
- Inspections
- Premises
- Certificates
- Facilities & Providers
- Finance
- Notices
- Reports
- Users & Roles
- Settings
- Audit Log
- System / Councils

Not every role sees every item.

Use frontend role switching to demonstrate role-based navigation.

Demo roles:

- Admin
- Super Admin
- EHO
- MOH / Director
- Finance Officer
- Business User

A small development/demo role switcher is acceptable.

## Header

Include where relevant:

- Page title
- Breadcrumbs
- Search
- Council selector
- Notifications
- User/profile menu

---

# 10. Role-Based Experiences

Do not build completely separate products when screens and components can be shared.

Use permissions and role-specific navigation.

## Admin / Super Admin

Main areas:

- Dashboard / Work Queue
- Applications
- Inspections
- Premises
- Certificates
- Facilities & Providers
- Finance
- Notices
- Reports
- Users & Roles
- Settings
- Audit Log
- System / Councils

Super Admin should use the same interface with broader scope and permissions.

## EHO

Keep the EHO interface lean.

Primary navigation:

- My Work
- Premises Search
- Profile / Sync

Main inspection flow:

My Work  
→ Inspection List  
→ Inspection Overview  
→ Inspection Checklist  
→ Contravention Detail  
→ Review & Submit  
→ Submission Result  
→ Findings Notice  
→ Follow-Up Inspection

Fumigation flow:

Fumigation Supervision List  
→ Fumigation Supervision Detail  
→ Confirm Report / Dispute Report

The EHO does not issue certificates.

## MOH / Director

Treat the MOH experience as a **decision inbox**.

Primary jobs:

- Decide Fitness Certificate cases
- Decide Fumigation Certificate cases
- Decide Health Approval
- Review certificates at risk
- Suspend / revoke / withdraw where authorised
- Approve facilities/providers
- Review reports

Example flow:

Approval Queue  
→ Case Review  
→ Decision Confirmation  
→ Decision Result

High-risk actions should visibly require:

- Written reason
- Password re-entry mock field
- Confirmation step

No real authentication is required.

## Business User

The Business Dashboard should be the main hub.

Main areas:

- Compliance overview
- Food handlers
- Fitness Certificate
- Fumigation Certificate
- Health Approval
- Inspections / corrective actions
- Certificates
- Receipts / application history where needed

Fitness flow:

Register business  
→ Add food handlers  
→ Start Fitness application  
→ Select approved facility  
→ Review  
→ Payment  
→ Payment confirmation  
→ Application tracking  
→ Certificate

Fumigation flow:

Start Fumigation application  
→ Select licensed provider  
→ Review  
→ Payment  
→ Service tracking  
→ Certificate

Health Approval cannot be directly applied for.

Flow:

Fitness + Fumigation requirements satisfied  
→ Health Approval eligibility  
→ Inspection notice  
→ Inspection  
→ Findings  
→ Corrective action  
→ Follow-up inspection  
→ Final decision

---

# 11. Important Product Rules

Reflect these rules in the UI and frontend behavior.

1. Only the MOH / Director can issue, suspend, revoke or withdraw certificates.
2. Payment does not guarantee certificate issuance.
3. Issued certificates cannot be edited.
4. Corrections require cancellation/replacement.
5. Inspections cannot proceed unless the required notice has been served.
6. Follow-up inspections require their own notice.
7. The system must not automatically suspend or revoke a certificate.
8. Private medical details must not be visible to employers/businesses.
9. `Not Found` must remain different from `Non-compliant`.
10. High-risk actions require explicit confirmation.
11. Historical records must preserve their original state.
12. Role permissions should control visibility and available actions.

---

# 12. Shared Components

Build reusable patterns.

Examples:

- App shell
- Sidebar
- Header
- Breadcrumbs
- Page header
- Status badge
- Data table
- Filter bar
- Search input
- Summary/stat cards
- Work queue
- Application timeline
- Certificate status card
- Premises compliance summary
- Detail sections
- Metadata rows
- Activity timeline
- Document list
- Empty state
- Warning banner
- Confirmation modal
- Sheet / drawer
- Tabs
- Form sections
- File/evidence preview
- Notice status component
- Audit event row
- User menu
- Pagination
- Role selector
- Council selector

Prefer Shadcn blocks and existing Shadcn patterns when appropriate.

---

# 13. Tables

Use **TanStack Table** for data-heavy views such as:

- Applications
- Inspections
- Premises
- Certificates
- Payments
- Facilities/providers
- Users
- Audit logs
- Reports where tabular

Support where relevant:

- Search
- Filters
- Sorting
- Pagination
- Status filtering
- Row actions
- Empty states
- Responsive behavior

Do not overcomplicate tables with unnecessary features.

---

# 14. Forms

Use **TanStack Form** for forms and multi-step workflows.

Examples:

- Business registration
- Food handler forms
- Fitness application
- Fumigation application
- Inspection checklist
- Contravention form
- MOH decision form
- Facility/provider forms
- Settings forms

Forms should support:

- Validation
- Clear errors
- Save draft
- Resume draft
- Cancel
- Review before submission where appropriate
- Disabled states
- Pending states
- Success feedback

---

# 15. Mock Data Architecture

Create a clean mock data layer.

Do not hardcode large data arrays directly inside page components.

Suggested structure:

- `/data`
- `/mocks`
- `/services`
- `/repositories`
- `/types`

Use whichever structure fits the existing codebase best.

Create realistic mock data for:

- Businesses
- Premises
- Food handlers
- Applications
- Certificates
- Inspections
- Contraventions
- Facilities
- Providers
- Payments
- Notices
- Admin users
- Councils
- Audit events

Use enough data to demonstrate:

- Filters
- Sorting
- Pagination
- Different statuses
- Edge cases
- Empty states
- Multiple councils
- Different roles

Do not use lorem ipsum.

Use realistic Nigerian/Rivers State context where appropriate, but do not invent regulatory requirements beyond the supplied product documents.

---

# 16. TanStack Start, Router, and Query Usage

Use **TanStack Start** as the application framework and **TanStack Router** as the routing foundation.

Use TanStack Router for:

- File-based application routes
- Nested layouts
- Typed route parameters
- Typed search parameters
- Filters, tabs, pagination, and council scope that should live in the URL
- Deep-linking into applications, premises, inspections, certificates, and other records

Prefer route/search-param state over hidden global client state when the state should be shareable, bookmarkable, or restored from the URL.

This prototype is frontend-only. Do not introduce TanStack Start server functions, API routes, or backend persistence unless explicitly requested later.

Even though there is no backend, use TanStack Query to model server/application state.

Create a lightweight mock service layer so the frontend behaves like a real app.

Examples:

- `getApplications()`
- `getApplication(id)`
- `updateApplication()`
- `saveDraft()`
- `getPremises()`
- `getCertificate()`
- `submitInspection()`
- `updateCertificateStatus()`

These should operate against local mock data/localStorage rather than real APIs.

Use queries and mutations so loading, success and error states can be represented realistically.

Do not create fake HTTP endpoints unless the existing project architecture already benefits from them.

---

# 17. Interaction Requirements

The prototype should support stakeholder walkthroughs.

Implement enough frontend state to demonstrate:

- Switching roles
- Switching councils where permitted
- Opening work queue items
- Filtering tables
- Searching premises
- Opening a premises record
- Starting an application
- Saving an application draft
- Leaving the flow
- Returning later and resuming it
- Selecting food handlers
- Selecting a facility/provider
- Completing a mock payment
- Tracking an application
- Acknowledging an inspection notice
- Completing an inspection checklist
- Adding a contravention
- Saving an inspection draft
- Submitting inspection findings
- Reviewing a case as MOH
- Approving or refusing a certificate
- Viewing an issued certificate
- Changing certificate status through a confirmation flow
- Reviewing audit history

Use mock transitions only.

No backend calls.

---

# 18. Status System

Use consistent status labels.

## Applications

- Draft
- Payment Required
- Confirming Payment
- Assessment In Progress
- Service In Progress
- Report Under Review
- Decision In Progress
- Approved
- Refused

## Certificates

- Active
- Expiring Soon
- Expired
- At Risk
- Suspended
- Revoked
- Withdrawn
- Replaced
- Not Found

## Inspections

- Scheduled
- Notice Pending
- Notice Served
- Acknowledgement Required
- In Progress
- Findings Issued
- Corrective Action Required
- Follow-Up Scheduled
- Resolved
- Further Action Required

Do not rely on color alone.

Always include text labels.

---

# 19. Responsiveness

Primary target: **desktop SaaS dashboard**.

Design desktop first.

Still make the app reasonably responsive.

Give extra attention to the EHO experience because officers may use it on tablets or phones in the field.

---

# 20. Code Quality Rules

- Work inside the existing project
- Keep components modular
- Avoid giant page components
- Avoid unnecessary dependencies
- Follow the existing codebase conventions
- Keep mock data separate from UI
- Keep types clear
- Reuse components
- Reuse Shadcn blocks where appropriate
- Keep styling consistent
- Avoid one-off UI patterns where a shared pattern can work
- Do not build backend architecture
- Do not overengineer
- Do not introduce Zustand unless you can clearly justify why the existing architecture cannot handle the state cleanly

---

# 21. Build Order

Do not build the entire product at once.

## Phase 1 — Foundation

1. Inspect repository
2. Review screenshots
3. Identify reusable Shadcn blocks/components
4. Establish design tokens
5. Build app shell
6. Build sidebar/header
7. Create shared UI patterns
8. Create mock data/types
9. Set up TanStack Query
10. Set up mock persistence
12. Build Admin Dashboard / Work Queue

## Phase 2 — Core Shared Views

Build:

- Premises list
- Premises detail
- Applications list
- Application detail
- Certificates list
- Certificate detail
- Inspections list
- Inspection detail

## Phase 3 — Role Workflows

Build:

- Business application flows
- EHO inspection flow
- MOH decision flow

## Phase 4 — Supporting Modules

Build:

- Finance
- Facilities & Providers
- Notices
- Reports
- Users & Roles
- Settings
- Audit Log
- Council management

---

# 22. Source-of-Truth Rules

The documents I provide are the source of truth for product behavior.

Use them in this priority:

1. Latest confirmed product decisions
2. UX flow screen specifications
3. End-to-end flow maps
4. Product concept / thesis
5. SRS
6. UI screenshots for visual direction only

Do not silently invent missing product behavior.

If two documents conflict:
- identify the conflict
- use the latest confirmed direction where clear
- otherwise flag it before implementation

Do not create new business rules just to complete a screen.

---

# 23. Before Coding

Before making significant changes, respond with a concise implementation plan containing:

1. What you found in the repository
2. TanStack Start / Router setup and major dependencies
3. Existing Shadcn setup
4. Existing Shadcn blocks that can be reused
5. Proposed route structure
6. Proposed component structure
7. Proposed mock-data/service architecture
8. Draft persistence approach
9. TanStack Router and URL-state strategy
10. TanStack Query strategy
11. Any contradictions or missing information that actually block implementation
12. The exact first screens you recommend building

Keep this concise.

Do not ask questions that are already answered in the supplied documents.

After the foundation is clear, begin implementation.
