# EHRCMS Web

Frontend prototype for the Environmental Health Regulatory and Compliance Management System. EHRCMS helps councils manage business premises, inspections, compliance findings, certificates, applications, and regulatory work.

## Current prototype

- Role-aware operational dashboard
- Council and demo-role switching
- Searchable premises register
- Premises compliance, certificate, inspection, and document details
- Browser-persisted mock data
- Responsive desktop and mobile shell
- Business account registration, demo contact verification, and autosaving premises setup
- Business dashboard with certificate status, next action, and compact navigation
- Food-handler management and Fitness Certificate journey
- Premises fumigation application through provider selection, payment confirmation, report, EHO review, and certificate view
- Health Approval eligibility, inspection notices, corrective actions, follow-up, and council outcome
- Business settings with inline profile editing, logo/avatar, premises photos, verified account details, and saved email preferences

## Shared welcome and account switching

Open [http://localhost:3000](http://localhost:3000) to choose Business, Environmental Health Officer, or Medical Officer of Health, then continue to that account's sign-in page. Signing out of any of these portals returns to this welcome page. Admin is not an option on the selector.

The MOH sign-in uses the assigned fictional account `MOH-001` or `nengi.alabo@phc.gov.ng`, password `director-demo`, and verification code `246810`. It opens a minimal MOH home with sign-out. This is a frontend fixture: credential and code checks run in the browser, and the browser stores only a local session marker. No council authentication, delivered verification code, or MOH decision workflow is connected.

## EHO field portal demo

Open `/eho/sign-in` and use the assigned account `EHO-001` or
`ebi.briggs@phc.gov.ng` with password `field-demo`. The **Use assigned
account** control fills the same credentials. Officers cannot create accounts;
an administrator assigns them. Invalid credentials and the disabled `EHO-002`
example show distinct errors.

In **My Work**, open `EIN-101` to complete a noticed inspection. `EIN-102` has
an unserved notice and cannot start. `EIN-103` starts with a partial saved draft,
and `EIN-104` shows a completed example with a contravention. Answer the three checklist items,
record an issue and corrective deadline for any Contravention, review, then
submit. Reload to check draft recovery. The premises compliance view is read
only; `Not Found` never means non-compliant. The officer can sign out without
deleting local drafts. From an inspection overview, **View notice** opens its
notice reference, visit details, service, and acknowledgement record. The
unserved `EIN-102` notice keeps **Start inspection** disabled; the served
`EIN-101` notice links through to its checklist. From the `EIN-104` result, open the local findings
summary and its seeded follow-up. Verify the previous issue as resolved,
outstanding, or unable to verify; optionally add a new contravention. Follow-up
entries save locally and survive reload. In **Fumigation supervision**, open
`FUM-201` to review a completed provider report, record attendance and a note,
then confirm or dispute it. `FUM-202` awaits a provider report, while `FUM-203`
is rescheduled. Search by premises, provider, or reference. Draft notes and the
final review decision survive reload. The EHO has no certificate decision action.
In **Premises Search**, look up a local council record by name, reference or
address, then open its compliance view. Recently opened records appear below the
search field. Code lookup accepts a premises reference or URL; supported browsers
can also scan a QR or Code 128 label with the device camera. `PR-005` demonstrates
the other-council boundary, and a direct link to that record is unavailable to
the Port Harcourt City Council account.
In the premises **Certificates** tab, **Record paper certificate seen** saves
the type, printed reference, date seen, optional expiry and observation to this
officer's local device record for that premises. Reload to reopen it. This does
not create or verify a digital certificate, alter the displayed certificate
status, upload a copy, or sync the observation to the council.
In **Profile / Sync**, review the assigned account, connection state, inspection
drafts, queued inspections, saved follow-ups, and report reviews. The page shows
no successful sync timestamp. **Sync now** reports an unavailable or offline
attempt without changing queued work. Sign-out warns when saved work remains;
the officer can cancel or sign out and return to the same device later.

Sign-in, inspection submission, offline queueing, and evidence selection are
frontend simulations. The browser stores a session marker and inspection data,
but no password or evidence file contents. A queued result does not sync to a
council server, and no official inspection or notice is created. Inspection
notice dates and references are fictional EHO fixtures; the detail view does
not issue or serve a notice. The findings summary is not a served notice, and completing follow-up does not make a council
decision. Fumigation jobs and provider reports are fictional fixtures scoped to
the assigned officer; reviews remain on this device and do not sync with the
business portal or a council server.
Premises search uses the seeded directory on this device; recent record IDs are
saved per officer. Camera scanning uses browser APIs when available and has a
manual code-entry fallback.
The profile has no council sync endpoint. Initial fictional inspection records
are persisted to officer-scoped local storage on first sign-in so they survive
sign-out; sync attempts never mark queued submissions delivered.

## Business portal demo

Open [/business/sign-in](http://localhost:3000/business/sign-in). Use either
`ada@riverside.ng` or `08031234567` with password `riverside-demo`, or select
**Sign in as Riverside Kitchen**. Both sign-in methods open the seeded Riverside Kitchen dashboard.

To try first-time onboarding, open [/business/register](http://localhost:3000/business/register)
and use a different email and phone. The visible verification code is `123456`.
The seeded email and phone are reserved and demonstrate the existing-account errors.
**Change contact** edits the saved registration without losing its business details.
Codes expire after five minutes; **Resend code** issues a fresh demo code after the
60-second cooldown (up to three resends on the verification screen).
Continue through `/business/verify` and `/business/setup` to `/business/dashboard`.
Setup changes autosave after 500 ms. Reloading or selecting **Save draft and exit**
keeps the draft. Select **Continue saved registration** on Sign In or Create Account
to resume in the same browser without replacing it with the seeded demo account.

Authentication, OTP delivery, and uploads are simulated. New registrations do not
create usable password credentials: only the seeded account supports sign-in.
Saved registration recovery is local to this browser and does not authenticate you;
anyone using this browser can continue its demo draft. Older saved registrations
without an expiry timestamp keep their details and require a new verification code.
Browser storage retains account/premises details, document metadata, and resized
profile images, never passwords, OTP values, or document contents. Signing out clears the active
business session. Saved edits to the seeded business profile and its images remain available when
that account signs in again. Use fictional data.

From the dashboard, open **Food handlers** to add or edit a handler. An incomplete
handler can be saved, but cannot be selected for a Fitness application. Start an
application, choose eligible handlers and a facility, review, and confirm a
simulated payment. The tracker then lets you simulate the facility's Fit result
and the council's certificate issuance. Open the issued certificate from
the tracker or Certificates page; refresh to see the saved state persist.
No real payment, medical assessment, or certificate issuance takes place.
Food handler and certificate application forms open in drawers inside the signed-in
portal; their URLs can still be opened directly. Inspection correction forms open
from the corresponding finding.

On **Food handlers**, search by name or role and filter current, ready, incomplete,
or archived staff. Archiving retains the record for history and allows restoration.
A person selected in an active Fitness application must be removed from that
application or wait until it is issued before they can be archived.

Open **Settings** for the Business profile, Account, and Notifications tabs.
Business and premises fields are editable directly on the Business profile tab;
select **Save changes** after editing. The same tab lets you upload or replace a
business avatar/logo and up to three premises or kitchen photos. PNG, JPG, and
WebP images up to 8 MB are accepted and resized for browser persistence. The
avatar appears in the account menu and the first premises photo appears on the
dashboard. The Account tab shows verified email, phone, and council assignment
read-only. Changing these requires a separate verification or council review
process. The Notifications tab saves application or inspection email preferences
for each business in this browser; the prototype does not send emails.

From the dashboard or Applications, start a Fumigation application. Confirm the premises
and service month, choose a licensed provider, review the total, and confirm the
simulated payment. The tracker has separate labelled controls to demonstrate
the provider report, EHO confirmation, and council decision. The issued
Fumigation Certificate can be viewed from the tracker or Certificates page and
persists on reload. No real payment, service, EHO confirmation, or council
issuance takes place.

Health Approval appears when both Fitness and Fumigation Certificates are issued;
there is no separate application. Open **Health Approval** from the dashboard
or Certificates page to see the eligibility checklist. The labelled council
controls can serve an inspection notice. In **Inspections**, acknowledge the
notice, review the findings, record a correction for each item, acknowledge the
separate follow-up notice, and view the final outcome. Council actions are
simulated in a separate control area. An issued Health Approval can be viewed
from its details page and remains in this browser. No official notice, inspection,
regulatory decision, or Health Approval is created.

Certificate, payment reference, and inspection notice download actions save
standalone printable HTML files. Each copy includes a record-copy note and
guidance to verify its status with the issuing council. Open it in a browser to
print or save as PDF if needed.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run check
npm test
npm run typecheck
npm run build
```

## Browser UI checks

Run the saved headless Playwright CLI suite with `npm run test:e2e`. It starts
an isolated local app, checks the rendered result and browser errors, and does
not capture screenshots. Follow the current browser rules in
[`AGENTS.md`](AGENTS.md). Run the unit and component suite separately with
`npm test`.

Product specifications and implementation plans live in [`docs/`](docs/).

## Documentation site

The Mintlify site lives in [`docs/`](docs/) and renders those Markdown documents
directly. Its navigation is configured in [`docs/docs.json`](docs/docs.json).
From that directory, run `mint dev --port 3333` to preview it without conflicting
with the application on port 3000. Run `mint validate` before publishing.

Existing product and engineering documents are in the **Internal
library**. The public overview is [`docs/index.mdx`](docs/index.mdx). Before
connecting the repository to a Mintlify deployment, configure **Partial
Authentication** in the Mintlify dashboard and confirm that an unsigned visitor
cannot open an internal page by URL. Frontmatter alone does not enforce access
without that dashboard setting. Mintlify must use the `docs/` directory as the
documentation root. Keep the Git repository private as well if these documents
must be confidential; Mintlify authentication does not hide repository files.
The `.docx` SRS remains an archive of the source draft;
edit the Markdown page for the web and synchronize the archive if needed.
