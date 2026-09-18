# EHRCMS Frontend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished frontend-only EHRCMS foundation with a role-aware admin shell, actionable dashboard, and filterable premises directory/detail experience backed by persistent mock data.

**Architecture:** Scaffold TanStack Start from the approved shadcn preset, then organize product code into shared UI, domain, service, and feature boundaries. TanStack Router owns navigation and shareable URL state; TanStack Query wraps a versioned localStorage repository; React context holds only demo role and council selection.

**Tech Stack:** TanStack Start, TanStack Router, TypeScript, Tailwind CSS, shadcn/ui preset `b7BYPilTE`, TanStack Query, TanStack Table, TanStack Form, Vitest, Testing Library

---

## File Map

### Scaffold and application setup

- `package.json` — scripts and dependencies
- `components.json` — shadcn preset output
- `src/routes/__root.tsx` — document shell and app providers
- `src/routes/index.tsx` — redirect to the dashboard
- `src/router.tsx` — router construction
- `src/styles.css` — preset tokens plus restrained EHRCMS surface rules
- `src/app/providers.tsx` — Query and demo-session providers
- `src/test/setup.ts` — DOM test matchers and localStorage cleanup
- `vite.config.ts` — TanStack Start and Vitest configuration

### Domain and mock state

- `src/domain/types.ts` — roles, statuses, councils, premises, work items, and activity types
- `src/domain/permissions.ts` — capability map and permission helpers
- `src/domain/permissions.test.ts` — permission invariants
- `src/data/seeds.ts` — realistic Rivers State seed records
- `src/services/storage.ts` — versioned localStorage adapter
- `src/services/storage.test.ts` — hydration and corrupted-data behavior
- `src/services/repository.ts` — typed mock repository
- `src/services/repository.test.ts` — filters and record lookup
- `src/services/query-options.ts` — query keys/options for dashboard and premises

### Shared product UI

- `src/components/shared/status-badge.tsx` — semantic status display with text
- `src/components/shared/status-badge.test.tsx` — accessible label coverage
- `src/components/shared/page-header.tsx` — title, context, and dominant action
- `src/components/shared/empty-state.tsx` — restrained empty state
- `src/components/shared/filter-bar.tsx` — search and filter composition
- `src/components/shared/data-table.tsx` — generic TanStack Table renderer
- `src/components/shared/activity-timeline.tsx` — regulatory activity history
- `src/components/shared/record-metadata.tsx` — compact key/value rows

### Shell and demo session

- `src/app/demo-session.tsx` — role and council context
- `src/app/demo-session.test.tsx` — switching behavior
- `src/components/shell/app-shell.tsx` — responsive sidebar/header layout
- `src/components/shell/app-shell.test.tsx` — core module navigation smoke test
- `src/components/shell/app-sidebar.tsx` — permission-filtered navigation
- `src/components/shell/app-header.tsx` — breadcrumbs, council, role, and user controls
- `src/components/shell/navigation.ts` — navigation metadata and capabilities
- `src/routes/_app.tsx` — shared application layout route

### Dashboard

- `src/features/dashboard/dashboard-screen.tsx` — dashboard composition
- `src/features/dashboard/summary-strip.tsx` — actionable summary metrics
- `src/features/dashboard/work-queue.tsx` — priority records and destinations
- `src/features/dashboard/dashboard-screen.test.tsx` — role/council queue behavior
- `src/routes/_app/dashboard.tsx` — dashboard route and search schema

### Premises

- `src/features/premises/premises-columns.tsx` — TanStack Table columns
- `src/features/premises/premises-directory.tsx` — filterable directory
- `src/features/premises/premises-directory.test.tsx` — filtering and navigation
- `src/features/premises/premises-detail.tsx` — central regulatory record
- `src/features/premises/compliance-summary.tsx` — certificate/compliance overview
- `src/features/premises/premises-detail.test.tsx` — Not Found vs non-compliant behavior
- `src/routes/_app/premises/index.tsx` — typed premises URL state
- `src/routes/_app/premises/$premisesId.tsx` — record detail and tab URL state

### Navigable core placeholders

- `src/components/shared/module-placeholder.tsx` — purposeful module handoff screen
- `src/routes/_app/applications/index.tsx`
- `src/routes/_app/applications/$applicationId.tsx`
- `src/routes/_app/inspections/index.tsx`
- `src/routes/_app/inspections/$inspectionId.tsx`
- `src/routes/_app/certificates/index.tsx`
- `src/routes/_app/certificates/$certificateId.tsx`

## Task 1: Scaffold the Approved TanStack Start and shadcn Foundation

**Files:**
- Create: `package.json`
- Create: `components.json`
- Create: `src/routes/__root.tsx`
- Create: `src/routes/index.tsx`
- Create: `src/router.tsx`
- Create: `src/styles.css`
- Create: `.gitignore`
- Modify: `vite.config.ts`

- [ ] **Step 1: Scaffold in an isolated temporary directory**

Run from `/tmp` so the non-empty document workspace is never overwritten:

```bash
npx shadcn@latest init --preset b7BYPilTE --template start --name ehrcms-prototype --no-monorepo
```

Expected: `/tmp/ehrcms-prototype` contains a TanStack Start app, `components.json`, and preset-generated styles.

- [ ] **Step 2: Copy only scaffold files into the repository**

Run:

```bash
rsync -a --exclude='.git' --exclude='node_modules' /tmp/ehrcms-prototype/ ./
```

Expected: product documents and `docs/` remain present; application files appear at the repository root.

- [ ] **Step 3: Install required TanStack and test dependencies**

Run:

```bash
npm install @tanstack/react-query @tanstack/react-table @tanstack/react-form
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Expected: dependencies are recorded once in `package.json` with no duplicate framework libraries.

- [ ] **Step 4: Add deterministic test scripts**

Ensure `package.json` includes:

```json
{
  "scripts": {
    "dev": "vite --port 3000",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 5: Add the Vitest environment**

Add to the exported Vite config:

```ts
test: {
  environment: "jsdom",
  setupFiles: ["./src/test/setup.ts"],
  globals: true,
},
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"

afterEach(() => {
  localStorage.clear()
})
```

- [ ] **Step 6: Verify the untouched baseline**

Run:

```bash
npm test
npm run build
```

Expected: both commands exit 0 before product code is added.

- [ ] **Step 7: Commit the scaffold**

```bash
git add .gitignore package.json package-lock.json components.json vite.config.ts tsconfig.json src
git commit -m "chore: scaffold EHRCMS TanStack Start app"
```

## Task 2: Define Domain Types and Permission Invariants

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/permissions.ts`
- Create: `src/domain/permissions.test.ts`

- [ ] **Step 1: Write failing permission tests**

```ts
import { describe, expect, it } from "vitest"
import { can, visibleNavigation } from "./permissions"

describe("EHRCMS permissions", () => {
  it("reserves certificate status decisions for MOH directors", () => {
    expect(can("admin", "certificate:status-change")).toBe(false)
    expect(can("eho", "certificate:status-change")).toBe(false)
    expect(can("moh-director", "certificate:status-change")).toBe(true)
  })

  it("shows system navigation only to super admins", () => {
    expect(visibleNavigation("admin")).not.toContain("system")
    expect(visibleNavigation("super-admin")).toContain("system")
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/domain/permissions.test.ts`

Expected: FAIL because `permissions.ts` does not exist.

- [ ] **Step 3: Define stable domain unions and record interfaces**

In `src/domain/types.ts`, define:

```ts
export type DemoRole =
  | "admin"
  | "super-admin"
  | "eho"
  | "moh-director"
  | "finance-officer"
  | "business-user"

export type ComplianceStatus =
  | "Compliant"
  | "At Risk"
  | "Non-compliant"
  | "Not Found"

export type CertificateStatus =
  | "Active"
  | "Expiring Soon"
  | "Expired"
  | "At Risk"
  | "Suspended"
  | "Revoked"
  | "Withdrawn"
  | "Replaced"
  | "Not Found"

export interface Council {
  id: string
  name: string
  code: string
}

export interface CertificateSummary {
  id?: string
  type: "Health Approval" | "Fumigation" | "Fitness"
  status: CertificateStatus
  expiresAt?: string
}

export interface Premises {
  id: string
  businessName: string
  tradingName: string
  address: string
  ward: string
  councilId: string
  premisesType: string
  complianceStatus: ComplianceStatus
  certificates: CertificateSummary[]
  outstandingContraventions: number
}

export interface WorkItem {
  id: string
  kind: "application" | "inspection" | "premises" | "certificate" | "payment"
  title: string
  description: string
  status: string
  councilId: string
  priority: "high" | "medium" | "normal"
  href: string
  permittedRoles: DemoRole[]
}

export interface ActivityEvent {
  id: string
  title: string
  description: string
  occurredAt: string
  actor: string
  href?: string
}

export interface PremisesFilters {
  q?: string
  councilId?: string
  ward?: string
  type?: string
  status?: ComplianceStatus
}

export interface MockDatabase {
  schemaVersion: 1
  councils: Council[]
  premises: Premises[]
  workItems: WorkItem[]
  activity: ActivityEvent[]
}
```

- [ ] **Step 4: Implement capability-based permissions**

In `src/domain/permissions.ts`, define a `Capability` union and explicit role maps. `can(role, capability)` returns a boolean. `visibleNavigation(role)` returns navigation IDs and includes `system` only for `super-admin`.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npm test -- src/domain/permissions.test.ts`

Expected: 2 tests pass.

- [ ] **Step 6: Commit the domain boundary**

```bash
git add src/domain
git commit -m "feat: define EHRCMS domain permissions"
```

## Task 3: Build Seed Data, Versioned Storage, and Repository Queries

**Files:**
- Create: `src/data/seeds.ts`
- Create: `src/services/storage.ts`
- Create: `src/services/storage.test.ts`
- Create: `src/services/repository.ts`
- Create: `src/services/repository.test.ts`
- Create: `src/services/query-options.ts`

- [ ] **Step 1: Write failing storage and repository tests**

```ts
import { describe, expect, it } from "vitest"
import { createStorage } from "./storage"
import { createRepository } from "./repository"

describe("mock data boundary", () => {
  it("falls back to seeds when persisted JSON is malformed", () => {
    localStorage.setItem("ehrcms:prototype:v1", "not-json")
    expect(createStorage().read().premises.length).toBeGreaterThan(0)
  })

  it("distinguishes Not Found from Non-compliant", async () => {
    const repository = createRepository(createStorage())
    const result = await repository.listPremises({ status: "Not Found" })
    expect(result.every((record) => record.complianceStatus === "Not Found")).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/services/storage.test.ts src/services/repository.test.ts`

Expected: FAIL because the service modules do not exist.

- [ ] **Step 3: Create realistic seed data**

Export `seedDatabase` with at least:

- 3 councils, including Port Harcourt City and Obio/Akpor
- 12 premises across all compliance states
- 10 work items across applications, inspections, certificates, payments, and premises
- 8 activity events
- Related certificate summaries and contravention counts

Use explicit record values such as `Riverside Kitchen & Foods`, `Trans-Amadi Food Court`, and `Garden City Cold Stores`; do not use lorem ipsum.

- [ ] **Step 4: Implement the storage adapter**

```ts
const STORAGE_KEY = "ehrcms:prototype:v1"

export function createStorage(storage: Storage = window.localStorage) {
  return {
    read(): MockDatabase {
      try {
        const raw = storage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) as MockDatabase : structuredClone(seedDatabase)
      } catch {
        return structuredClone(seedDatabase)
      }
    },
    write(database: MockDatabase) {
      storage.setItem(STORAGE_KEY, JSON.stringify(database))
    },
    reset() {
      storage.removeItem(STORAGE_KEY)
    },
  }
}
```

Guard browser-only access by accepting the `Storage` dependency and constructing it inside client query functions.

- [ ] **Step 5: Implement repository filters and lookups**

`listPremises` accepts `{ q?, councilId?, ward?, type?, status? }`, performs case-insensitive search, preserves exact status semantics, and returns a promise. `getPremises(id)` returns the matching record or `undefined`. Dashboard methods filter work items by role and council.

- [ ] **Step 6: Add query option factories**

Export stable keys and options:

```ts
export const queryKeys = {
  dashboard: (role: DemoRole, councilId: string) => ["dashboard", role, councilId] as const,
  premises: (filters: PremisesFilters) => ["premises", filters] as const,
  premisesDetail: (id: string) => ["premises", id] as const,
}
```

- [ ] **Step 7: Run tests and verify GREEN**

Run: `npm test -- src/services/storage.test.ts src/services/repository.test.ts`

Expected: all storage and repository tests pass.

- [ ] **Step 8: Commit the mock state boundary**

```bash
git add src/data src/services
git commit -m "feat: add persistent EHRCMS mock repository"
```

## Task 4: Add Providers, Demo Session, and Role-Aware Shell

**Files:**
- Create: `src/app/providers.tsx`
- Create: `src/app/demo-session.tsx`
- Create: `src/app/demo-session.test.tsx`
- Create: `src/components/shell/navigation.ts`
- Create: `src/components/shell/app-shell.tsx`
- Create: `src/components/shell/app-sidebar.tsx`
- Create: `src/components/shell/app-header.tsx`
- Create: `src/routes/_app.tsx`
- Modify: `src/routes/__root.tsx`
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Write the failing demo-session test**

Render a harness inside `DemoSessionProvider`, choose `super-admin`, and assert the role plus cross-council selector state updates.

```tsx
expect(screen.getByText("Admin")).toBeInTheDocument()
await user.selectOptions(screen.getByLabelText("Demo role"), "super-admin")
expect(screen.getByText("Super Admin")).toBeInTheDocument()
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/app/demo-session.test.tsx`

Expected: FAIL because `DemoSessionProvider` does not exist.

- [ ] **Step 3: Implement the two small app-wide providers**

`Providers` owns one `QueryClient`. `DemoSessionProvider` owns `role`, `councilId`, `setRole`, and `setCouncilId`, persisting only the selected demo values under `ehrcms:demo-session`.

- [ ] **Step 4: Define role-aware navigation metadata**

Each navigation entry contains `id`, `label`, `href`, `icon`, and optional `capability`. Include the full documented navigation, but show only implemented routes as active links; visually mark later modules as upcoming only inside their purposeful placeholder screens.

- [ ] **Step 5: Implement the shadcn shell**

Use shadcn sidebar, breadcrumb, dropdown-menu, select, avatar, sheet, button, and separator components. Desktop uses a persistent sidebar; smaller screens use a sheet. Keep the user area anchored at the bottom.

- [ ] **Step 6: Wire the layout routes**

`__root.tsx` renders `<Providers><Outlet /></Providers>`. `index.tsx` redirects to `/dashboard`. `_app.tsx` wraps child routes in `AppShell`.

- [ ] **Step 7: Run tests and build**

Run:

```bash
npm test -- src/app/demo-session.test.tsx
npm run build
```

Expected: test passes and build exits 0.

- [ ] **Step 8: Commit the shell**

```bash
git add src/app src/components/shell src/routes
git commit -m "feat: add role-aware EHRCMS app shell"
```

## Task 5: Create Shared Operational UI Patterns

**Files:**
- Create: `src/components/shared/status-badge.tsx`
- Create: `src/components/shared/status-badge.test.tsx`
- Create: `src/components/shared/page-header.tsx`
- Create: `src/components/shared/empty-state.tsx`
- Create: `src/components/shared/filter-bar.tsx`
- Create: `src/components/shared/data-table.tsx`
- Create: `src/components/shared/activity-timeline.tsx`
- Create: `src/components/shared/record-metadata.tsx`

- [ ] **Step 1: Write the failing status accessibility test**

```tsx
render(<StatusBadge status="Not Found" />)
expect(screen.getByText("Not Found")).toBeVisible()
expect(screen.getByText("Not Found")).toHaveAttribute("data-status", "not-found")
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/components/shared/status-badge.test.tsx`

Expected: FAIL because `StatusBadge` does not exist.

- [ ] **Step 3: Implement explicit semantic status mapping**

Map statuses to muted variants. Never render a color-only indicator. Treat `Not Found` as neutral/unknown and `Non-compliant` as destructive.

- [ ] **Step 4: Implement the remaining focused shared components**

`DataTable<TData, TValue>` accepts columns, data, empty content, and table state without importing feature records. `FilterBar` composes children. `PageHeader` accepts title, description, breadcrumbs, and one primary action slot. Timeline and metadata components accept typed presentation records.

- [ ] **Step 5: Run shared tests and build**

Run:

```bash
npm test -- src/components/shared/status-badge.test.tsx
npm run build
```

Expected: test passes and generic component types compile.

- [ ] **Step 6: Commit shared UI**

```bash
git add src/components/shared
git commit -m "feat: add EHRCMS operational UI patterns"
```

## Task 6: Build the Admin Dashboard and Work Queue

**Files:**
- Create: `src/features/dashboard/dashboard-screen.tsx`
- Create: `src/features/dashboard/summary-strip.tsx`
- Create: `src/features/dashboard/work-queue.tsx`
- Create: `src/features/dashboard/dashboard-screen.test.tsx`
- Create: `src/routes/_app/dashboard.tsx`

- [ ] **Step 1: Write failing dashboard behavior tests**

Test that an admin sees assigned-council queue items, a super admin can see cross-council items, and a role without an action capability receives an `Open record` link rather than an unauthorized action label.

```tsx
expect(await screen.findByRole("heading", { name: "Work queue" })).toBeVisible()
expect(screen.getByText("Applications awaiting action")).toBeVisible()
expect(screen.getAllByRole("link", { name: /open/i }).length).toBeGreaterThan(0)
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test -- src/features/dashboard/dashboard-screen.test.tsx`

Expected: FAIL because the dashboard components do not exist.

- [ ] **Step 3: Define typed dashboard search state**

Validate `q`, `status`, `type`, `council`, and `date` in the route. Normalize empty strings to `undefined`. Route loaders prefetch the matching dashboard query.

- [ ] **Step 4: Implement the dashboard hierarchy**

Render compact summary metrics, followed by the work queue and recent activity. Avoid a wall of cards. Queue rows show kind, title, council, status, priority, and one clear destination.

- [ ] **Step 5: Connect filters to route search parameters**

Search/filter changes use `navigate({ search })`; they do not create hidden duplicated filter state. Debounce free-text input only if interaction profiling demonstrates a need.

- [ ] **Step 6: Run dashboard tests and build**

Run:

```bash
npm test -- src/features/dashboard/dashboard-screen.test.tsx
npm run build
```

Expected: tests pass and `/dashboard` is included in the generated route tree.

- [ ] **Step 7: Commit the dashboard**

```bash
git add src/features/dashboard src/routes/_app/dashboard.tsx src/routeTree.gen.ts
git commit -m "feat: build admin work queue dashboard"
```

## Task 7: Build the Premises Directory with URL-Driven TanStack Table State

**Files:**
- Create: `src/features/premises/premises-columns.tsx`
- Create: `src/features/premises/premises-directory.tsx`
- Create: `src/features/premises/premises-directory.test.tsx`
- Create: `src/routes/_app/premises/index.tsx`

- [ ] **Step 1: Write failing directory interaction tests**

Render with seeded records, enter `Trans-Amadi`, select `Not Found`, and assert only exact matching records remain. Assert each row has an `Open premises` link to `/premises/$premisesId`.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/features/premises/premises-directory.test.tsx`

Expected: FAIL because the premises directory does not exist.

- [ ] **Step 3: Define route search validation**

Support `q`, `council`, `ward`, `type`, `status`, `page`, `pageSize`, and `sort`. Default to page 1, page size 10, and business name ascending.

- [ ] **Step 4: Implement compact operational columns**

Columns: business/premises identity, address/ward, council, certificate summary, compliance status, contravention count, and contextual row actions. Keep actions keyboard accessible.

- [ ] **Step 5: Connect TanStack Table to controlled URL state**

Sorting, pagination, and filters update search params. The query key includes normalized filters. The empty state distinguishes no records from no filter matches.

- [ ] **Step 6: Run tests and build**

Run:

```bash
npm test -- src/features/premises/premises-directory.test.tsx
npm run build
```

Expected: directory tests pass and route types compile.

- [ ] **Step 7: Commit the directory**

```bash
git add src/features/premises src/routes/_app/premises/index.tsx src/routeTree.gen.ts
git commit -m "feat: add filterable premises directory"
```

## Task 8: Build the Central Premises Detail Record

**Files:**
- Create: `src/features/premises/premises-detail.tsx`
- Create: `src/features/premises/compliance-summary.tsx`
- Create: `src/features/premises/premises-detail.test.tsx`
- Create: `src/routes/_app/premises/$premisesId.tsx`

- [ ] **Step 1: Write failing regulatory-status tests**

```tsx
expect(screen.getByText("Not Found")).toBeVisible()
expect(screen.queryByText("Non-compliant")).not.toBeInTheDocument()
expect(screen.getByRole("tab", { name: "Inspections" })).toBeVisible()
```

Add a separate test asserting missing record IDs render a restrained `Premises not found` state with a link back to the directory.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/features/premises/premises-detail.test.tsx`

Expected: FAIL because detail components do not exist.

- [ ] **Step 3: Define detail tab search state**

Accept `tab` values `overview`, `inspections`, `documents`, and `history`, defaulting to `overview`. Tab changes update the URL.

- [ ] **Step 4: Implement the structured record header and summary**

Show business identity, address, council, compliance status, contextual next action, and certificate summaries. Use grouped sections and metadata rows rather than a card per field.

- [ ] **Step 5: Implement detail sections and history**

Overview contains certificates and outstanding contraventions. Other tabs render inspection rows, document metadata, and an activity timeline. Historical values remain read-only.

- [ ] **Step 6: Run tests and build**

Run:

```bash
npm test -- src/features/premises/premises-detail.test.tsx
npm run build
```

Expected: detail tests pass, unknown IDs are handled, and route params are typed.

- [ ] **Step 7: Commit the premises detail**

```bash
git add src/features/premises src/routes/_app/premises/'$premisesId.tsx' src/routeTree.gen.ts
git commit -m "feat: add premises regulatory detail view"
```

## Task 9: Complete Navigable Core Destinations Without Inventing Workflows

**Files:**
- Create: `src/components/shared/module-placeholder.tsx`
- Create: `src/components/shell/app-shell.test.tsx`
- Create: `src/routes/_app/applications/index.tsx`
- Create: `src/routes/_app/applications/$applicationId.tsx`
- Create: `src/routes/_app/inspections/index.tsx`
- Create: `src/routes/_app/inspections/$inspectionId.tsx`
- Create: `src/routes/_app/certificates/index.tsx`
- Create: `src/routes/_app/certificates/$certificateId.tsx`

- [ ] **Step 1: Write a failing navigation smoke test**

Assert the shell links for Applications, Inspections, and Certificates resolve to purposeful pages with the correct heading and a concise statement that the module is scheduled for the next implementation slice.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/components/shell/app-shell.test.tsx`

Expected: FAIL because destinations are missing.

- [ ] **Step 3: Implement one shared placeholder composition**

The component accepts `title`, `description`, and optional related-record metadata. It must not display invented business actions. Detail placeholders link back to their module list and, where a known mock record exists, show only documented summary fields.

- [ ] **Step 4: Add typed list and detail routes**

Create all six routes so dashboard and premises cross-links never dead-end. Keep them visibly incomplete but useful; do not implement undocumented decision behavior.

- [ ] **Step 5: Run the smoke test and build**

Run:

```bash
npm test -- src/components/shell/app-shell.test.tsx
npm run build
```

Expected: all primary Phase 1 links resolve and build passes.

- [ ] **Step 6: Commit navigable destinations**

```bash
git add src/components/shared/module-placeholder.tsx src/components/shell/app-shell.test.tsx src/routes src/routeTree.gen.ts
git commit -m "feat: connect core EHRCMS module routes"
```

## Task 10: Perform Accessibility, Responsive, and Completion Verification

**Files:**
- Modify: `src/styles.css`
- Modify: affected shell and feature files only when verification reveals a concrete defect

- [ ] **Step 1: Run the full automated suite**

Run:

```bash
npm test
npm run build
```

Expected: zero test failures and a successful production build.

- [ ] **Step 2: Start the application for browser verification**

Run: `npm run dev`

Expected: the development server reports `http://localhost:3000`.

- [ ] **Step 3: Walk the required desktop flow**

At 1440×1000 verify:

1. `/` redirects to `/dashboard`.
2. Admin role shows assigned-council work.
3. Super Admin exposes System/Councils navigation and cross-council scope.
4. Dashboard filters update the URL.
5. A queue item opens its intended record.
6. Premises filters, sorting, and pagination update the URL.
7. A premises row opens its detail page.
8. Detail tabs update `tab` in the URL.
9. `Not Found` remains visually and textually distinct from `Non-compliant`.

- [ ] **Step 4: Walk responsive sizes**

At 1024×768 and 390×844 verify the content remains readable, the sidebar becomes a sheet when required, tables remain usable through prioritization/scrolling, and no primary action is clipped.

- [ ] **Step 5: Check keyboard and semantic behavior**

Tab through sidebar, filters, table rows, menus, and detail tabs. Verify visible focus, labelled controls, heading order, text status labels, and Escape behavior for sheets/menus.

- [ ] **Step 6: Fix only defects found by verification**

For each defect, add or update the closest automated regression test first, run it to observe failure, apply the smallest fix, and rerun the focused test.

- [ ] **Step 7: Re-run completion gates**

Run:

```bash
npm test
npm run build
git diff --check
git status --short
```

Expected: tests and build pass, `git diff --check` emits nothing, and status contains only intentional changes.

- [ ] **Step 8: Commit final verified polish**

```bash
git add src package.json package-lock.json
git commit -m "fix: complete EHRCMS foundation verification"
```
