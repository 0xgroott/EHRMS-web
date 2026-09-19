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
- Food-handler management and a simulated Fitness Certificate journey

## Business portal demo

Open [/business/sign-in](http://localhost:3000/business/sign-in). Use either
`ada@riverside.ng` or `08031234567` with password `riverside-demo`, or select
**Use demo account**. Both sign-in methods open the seeded Riverside Kitchen dashboard.

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
Browser storage retains account/premises details and document metadata, never
passwords, OTP values, or document contents. Signing out clears the business demo
state; signing in with the seeded account replaces it. Use fictional data.

From the dashboard, open **Food handlers** to add or edit a handler. An incomplete
handler can be saved, but cannot be selected for a Fitness application. Start an
application, choose eligible handlers and a demo facility, review, and make a
simulated payment. The tracker then lets you simulate the facility's Fit result
and the council's certificate issuance. Open the issued demo certificate from
the tracker or Certificates page; refresh to see the saved state persist.
No real payment, medical assessment, or certificate issuance takes place.

Fitness applications and certificates are available in the business portal.
Fumigation, inspections, and business profile remain upcoming-slice screens.

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

## Browser journey checks

Install Python Playwright and its Chromium browser once:

```bash
python3 -m pip install playwright
python3 -m playwright install chromium
```

Build, then run the maintained checks against an isolated production preview:

```bash
npm run build
python3 scripts/check-business-portal.py --start-server
```

The script owns a preview server on port 3019 and stops it afterward. It refuses
to use an occupied port. To test an existing server instead, run:

```bash
python3 scripts/check-business-portal.py --base-url http://localhost:3000
```

Checks cover onboarding, duplicate-contact recovery, contact editing, OTP expiry/resend,
draft persistence and visible resume, email/phone sign-in, stage guards, staff-role
handoff, desktop menus, mobile navigation at 390 px, the Fitness application and
issuance demo, issued-state persistence, horizontal overflow, and browser errors.
Each run uses fresh browser contexts without touching your browser's saved data.
Optional `--screenshots /tmp/ehrcms-browser-checks` captures desktop and mobile
dashboards. Any failed assertion exits nonzero.

Product specifications and implementation plans live in [`docs/`](docs/).
