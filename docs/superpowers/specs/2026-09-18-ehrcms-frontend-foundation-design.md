# EHRCMS Frontend Foundation Design

## Purpose

Build the first phase of a frontend-only clickable prototype for the Environmental Health Regulatory Case Management System (EHRCMS). The prototype will run entirely against realistic local mock data while behaving like production operational software.

This design covers the application foundation and the first polished vertical slice: the shared admin shell, Admin/Super Admin Dashboard and Work Queue, and Premises list/detail views. Later modules will extend the same architecture.

## Source of Truth

Implementation decisions follow the supplied documents in this order:

1. Confirmed decisions in `EHRCMS_TanstackStart_Frontend_Prototype_Build_Prompt (1).md`
2. UX flow screen specifications
3. End-to-end flow maps
4. Product concept or thesis material
5. `SRS_EHRCMS_Draft 2.md`
6. Future screenshots, used only for visual direction

The current workspace contains product documents but no application starter, screenshots, or existing Git history. The user approved initializing a fresh project in place. Existing documents must remain untouched.

## Delivery Scope

### Included in the first implementation phase

- Fresh TanStack Start application with TypeScript
- TanStack Router file-based routing
- Tailwind CSS and shadcn/ui using preset `b7BYPilTE`
- TanStack Query for asynchronous mock application state
- TanStack Table for operational tables
- TanStack Form for forms introduced in this phase
- Shared role-aware application shell
- Demo role and council switching
- Typed mock domain models, repositories, and services
- Local persistence boundary using `localStorage`
- Admin/Super Admin Dashboard and Work Queue
- Premises directory and premises detail
- Shared status, filtering, timeline, table, empty-state, and warning patterns
- Desktop-first responsive behavior, with foundations suitable for later field-oriented EHO screens

### Excluded

- Backend APIs, databases, server functions, and API routes
- Real authentication, payments, messaging, or file storage
- Production security or regulatory integrations
- Full implementation of every documented module in the first phase
- A separate application for Super Admin
- A global state-management library

## Architecture

The application will use feature boundaries on top of a small shared platform layer.

```text
src/
  components/
    ui/                 # shadcn components
    shared/             # reusable product patterns
  features/
    dashboard/
    premises/
    applications/
    inspections/
    certificates/
  data/
    seeds/              # realistic immutable seed data
  domain/
    types/              # shared domain types and status unions
    permissions/        # role/capability rules
  services/
    repositories/       # mock record access and persistence
    queries/            # query options and mutation helpers
    storage/            # localStorage adapter and versioning
  routes/               # TanStack Router file routes
  app/                  # providers and application-wide setup
```

Presentation components will not read or write `localStorage`. Routes call feature query hooks, which call services, which call repositories and the storage adapter. This preserves a replaceable boundary for a future backend.

## Routing and URL State

Initial route structure:

```text
/
/dashboard
/applications
/applications/$applicationId
/inspections
/inspections/$inspectionId
/premises
/premises/$premisesId
/certificates
/certificates/$certificateId
```

The root route redirects to `/dashboard`. A protected-looking application layout provides the shared shell, but authentication is simulated.

Typed search parameters will hold state that should survive refreshes or be shareable:

- `q` for search
- `status` and `type` filters
- `council` scope
- `tab` for related detail views
- `page` and `pageSize` for pagination
- `sort` for table ordering

Transient presentation state such as an open dialog, hover state, or temporary selection stays in local component state.

## Application Shell and Permissions

One reusable shell serves Admin and Super Admin and later supports EHO, MOH/Director, Finance Officer, and Business User variants.

The shell contains:

- Lightweight persistent sidebar
- Compact role-aware navigation groups
- Page title and breadcrumbs
- Search entry point
- Council selector for users with council scope
- Notifications affordance
- User/profile menu
- Demo role switcher

Capabilities, rather than role-name checks scattered through components, determine navigation visibility and available actions. Super Admin uses the same screens with broader council scope and additional system navigation.

The initial permission model must encode these safeguards:

- Only MOH/Director can issue, suspend, revoke, or withdraw certificates.
- Issued certificates are immutable.
- Payment never causes automatic issuance.
- Audit records are read-only.
- Users remain council-scoped unless cross-council permission is present.
- High-risk actions require an explicit confirmation flow.

## Design System and Visual Direction

The implementation will initialize shadcn/ui with preset `b7BYPilTE` and prefer a suitable shadcn sidebar/dashboard block for the shell. Existing block structure and tokens take precedence over future visual references.

The product language is calm, neutral, and operational:

- Restrained primary accent
- Subtle borders and little or no shadow
- Medium radii derived from the preset
- Compact typography and controls
- Spacious page hierarchy without low-density marketing layouts
- Semantic status colors paired with explicit text labels
- One dominant action per page
- Cards used selectively rather than as a container for every element

The desktop dashboard is the primary target. Layout primitives must collapse cleanly for smaller screens without introducing a separate mobile application.

## Shared Components

The first phase establishes the following reusable patterns:

- `AppShell`
- `RoleAwareSidebar`
- `AppHeader`
- `PageHeader`
- `Breadcrumbs`
- `RoleSwitcher`
- `CouncilSelector`
- `StatusBadge`
- `DataTable`
- `FilterBar`
- `SearchInput`
- `WorkQueue`
- `SummaryStrip`
- `RecordMetadata`
- `ActivityTimeline`
- `ComplianceSummary`
- `WarningBanner`
- `EmptyState`
- `ConfirmActionDialog`
- `PaginationControls`

Shared components expose product-oriented props and do not depend directly on seed data.

## Mock Domain and Data Flow

The first seed set covers councils, users, businesses, premises, applications, inspections, certificates, contraventions, payments, notices, providers, facilities, and audit events. Records use realistic Rivers State context without inventing regulatory requirements.

Each entity has a typed repository interface. Mock service functions return promises with short deterministic delays so loading and mutation feedback are visible without making the prototype unreliable.

Example flow:

```text
Route search params
  -> feature query options
  -> mock service
  -> repository
  -> versioned localStorage data or seed fallback
  -> TanStack Query cache
  -> route/component rendering
```

Mutations update the repository, invalidate or update the appropriate query keys, and display feedback. Seed reset support will allow demos to return to a known state.

## Draft Persistence

Drafts are domain records, not raw form snapshots hidden inside components. The storage adapter will:

- Namespace EHRCMS prototype data
- Store a schema version
- Hydrate from seeds when no compatible local data exists
- Persist mutations and drafts
- Permit a deliberate demo reset
- Recover safely from malformed stored data by retaining the bad value for diagnostics and falling back to seeds

TanStack Form owns active form state. Saving creates or updates the draft record through a TanStack Query mutation. Resuming loads the record through a query and uses it as the form's initial values.

## First Screens

### Dashboard and Work Queue

The dashboard answers three questions: what needs attention, what changed, and what should happen next.

It contains:

- Compact summary strip for actionable counts
- Priority work queue with role-appropriate rows
- Recent activity timeline
- Search and filters for council, status, type, and date
- Links into applications, inspections, premises, certificates, and payments
- Empty and partial-data states

The queue changes with role and council scope. Users who can view but not act see the record without an unauthorized CTA.

### Premises Directory

The directory uses TanStack Table with search, council, ward, premises type, and compliance filters. Search and filter state live in route search parameters. Rows show certificate summaries and outstanding contraventions, with direct navigation to a premises record.

### Premises Detail

The premises record is the central regulatory view. It includes:

- Identity and address summary
- Overall compliance status with clear distinction between `Not Found` and `Non-compliant`
- Health Approval, Fumigation, and food-handler Fitness summaries
- Outstanding contraventions
- Supporting documents
- Inspection history
- Status and activity timeline
- Contextual next action based on status and permission

Tabs separate overview, inspections, documents, and history while keeping the current tab in the URL.

## Error and Feedback Behavior

The mock service layer can represent loading, empty, recoverable error, and permission-denied states. Screens use:

- Skeletons for initial loading
- Inline errors with retry for failed reads
- Toasts for successful mutations
- Field-level validation for forms
- Warning banners for blocked regulatory conditions
- Confirmation dialogs for destructive or high-risk transitions
- Disabled actions with explanatory copy when prerequisites are missing

Errors must not silently reinterpret regulatory statuses. In particular, missing lookup results remain `Not Found`, not `Non-compliant`.

## Testing Strategy

Testing will be proportional to prototype risk:

- Unit tests for permission rules, status mapping, storage migration/fallback, filtering, and repository mutations
- Component tests for shared filters, status badges, empty states, and confirmation behavior
- Route-level tests for typed search parameters and role/council visibility
- Interaction tests for dashboard navigation, table filtering, and persisted draft save/resume when those forms are introduced
- A production build as the minimum completion gate for each implementation slice
- Browser walkthroughs at desktop and representative tablet/mobile widths

## Delivery Sequence

1. Initialize the repository and TanStack Start application.
2. Add required TanStack and shadcn foundations without duplicate libraries.
3. Establish tokens, providers, route layout, and application shell.
4. Add domain types, permissions, seed data, repositories, and storage adapter.
5. Configure TanStack Query and mock service query keys.
6. Build shared operational UI patterns.
7. Build and verify the Admin Dashboard and Work Queue.
8. Build and verify Premises Directory and Premises Detail.
9. Add route shells for the other core shared modules only when needed for working navigation.

## Deferred Decisions

Future screenshots may refine visual tuning but cannot replace the approved shadcn preset or documented UX behavior. Detailed role workflows for Business User, EHO, and MOH/Director will receive their own implementation slices after the shared foundation is stable.
