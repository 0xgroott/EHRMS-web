# LGA Council oversight

Approved scope: assigned accounts like MOH; sign-in and verification land directly on Dashboard. The role is LGA Chairman and the workspace is LGA Council. Reuse existing components, names and structures.

## Pages and boundaries

- Dashboard: collections, registered premises, pending Health approvals, inspections due, compliance risks, certificate expiry and recent activity.
- Finance: collections, LGA share, payouts, outstanding settlements and refunds, filtered by date, ward and service.
- Health approvals: read-only status, inspection reference and waiting time; no decision controls.
- Premises: existing searchable directory, ward/type/status filters, shared read-only profile, inspection history and certificates. Exclude individual medical results and document contents from oversight.
- Inspections: existing inspection summaries, outstanding findings and follow-up visibility, without conducting or scheduling controls.
- Reports: council-scoped uploaded documents grouped by Revenue, Compliance and Service performance, with title search, upload metadata, View and Download actions.

Premises-linked records are selected using the assigned account's council ID and joined to premises in that council before filtering or aggregation. Ward labels are subordinate to council IDs, not independent authorization identifiers. Council-level recent activity has no ward or premises identifier in the existing model; it stays council-scoped and is explicitly labelled council-wide, independent of the ward filter. No council switcher. Unknown and foreign record links return the same unavailable state. No administrative, financial-write or certificate-decision capability. Active LGA sessions opening the legacy shared admin console are redirected to LGA Dashboard before records render.

## Reuse

Parameterize the existing MOH access, header, sidebar and premises components with defaults preserving MOH behavior. Use Business-style compact Card summaries and shared PageHeader, EmptyState, StatusBadge, table, tabs, input, select and sidebar primitives. No new dependencies or color tokens. Existing semantic colors and theme controls apply.

## Data and limitations

Use existing fictional premises, inspections, approvals and activity. Finance requires new fictional ledger fixtures for Fitness medical tests and Fumigation linked to those premises; there are no Health Approval, application or certificate fees (SRS section 9). It has no existing functional data model. Persist only an assigned account identifier in the LGA session key, never passwords/codes. Like the current app, authentication and data are frontend fixtures; real authorization must be enforced by a backend before deployment with real records. No external integration is in scope.

## Motion review

No additional motion is needed. Reject animated metric counting (interferes with reading), page/list entrances (frequent navigation) and animated filter results (functional data). Reuse existing component transitions. The upstream sidebar animates layout properties; changing that shared behavior is outside this task.

## Verification

Unit tests: account validation, canonical session identity, foreign/unknown premises exclusion, aggregates, filters and CSV escaping. Component tests: reused MOH behavior and LGA navigation. Saved headless Playwright: sign-in/code errors, quick access, direct Dashboard landing, reload/logout, all pages, filtering, exports, foreign links, desktop/390px overflow and console/page errors. Run focused unit tests separately from browser tests; lint explicitly touched files and run typecheck/build for new routes.

## Interface simplification — second pass

Reuse Business Dashboard compact cards and line tabs. Dashboard groups compliance risks, expiring certificates and recent activity into tabs. Finance uses three principal totals plus an inline row for payouts/refunds/payment count; net-of-refund context stays visible. Reports use the same line tabs. Search, ward and status share a compact toolbar; date controls retain visible labels and errors. Remove generic introductions, decorative metric icons, redundant card borders around tables and details, repeated zero-findings messages and repeated expiry instructions. Preserve all records, filters, report exports, LGA scope and accessible names. No additional motion or color tokens.

Second-pass verification: task lint passed for the five changed LGA presentation files and the updated browser spec; all seven LGA browser tests passed, including desktop/390px layout, dashboard/report tabs, filters, exports and console/page error checks.

## Existing component reuse correction

Remove the feature-specific LgaTable wrapper. Compose shared Table, TableHeader, TableBody, TableRow, TableHead and TableCell directly, as Business and EHO do. Use the Business bordered table container, default shared cell spacing, and EHO right-aligned action columns. Keep horizontal scrolling inside the shared Table container on mobile. Reuse TelemetryCard for Dashboard and Finance summaries, allowing currency values and optional supporting text while preserving existing Business and EHO defaults. Retain shared EmptyState, StatusBadge, Select, Input, Button, Tabs and the existing premises directory/profile; keep filtering, exports, read-only scope and router links unchanged.

## Report library — approved replacement

Reports now lists uploaded documents in Revenue, Compliance and Service performance categories. Each record has a title, upload date, uploader, View and Download actions. Reuse shared shadcn tables on desktop and the existing mobile card pattern. Search titles, sort newest uploads first, and preserve category/search through report viewing and browser history. Remove live calculations, metric cards, data filters and CSV export from this page; Finance retains its existing ledger and filters.

Use fictional immutable document fixtures for the prototype. Plain-text files supply both the readable preview and downloaded document; no upload flow, document persistence or external service is introduced. Reports are prepared by MOH for a specific ward within the assigned LGA. Show Ward and Prepared by (MOH) alongside the title, upload date and actions, including mobile cards and report details. The upload workflow remains outside this change. The assigned council scopes metadata and document selection; unknown or foreign report IDs show the same unavailable state. Production must enforce file and metadata access on the backend. No extra animation or design tokens.
