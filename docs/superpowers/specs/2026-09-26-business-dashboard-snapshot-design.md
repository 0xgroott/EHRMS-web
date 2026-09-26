# Business Dashboard Snapshot Design

## Purpose

Replace the business dashboard's dominant next-action treatment with a calmer business snapshot. Keep the certification journeys easy to start without making the entire page feel task-driven.

## Confirmed Decisions

- Use the existing restrained, official portal language and green semantic tokens.
- Place the business identity and premises summary at the upper left.
- Place a prominent certification panel at the upper right, inspired by the supplied banking-dashboard composition rather than its branding.
- Open a modal with exactly two choices: Health Fitness Certificate and Fumigation Certificate.
- Adapt each choice to the current state: begin, continue, renew, or view.
- Show only reliable telemetry: kitchen staff and issued certificates. Do not invent a total-staff value because the portal does not collect one.
- Show a banner explaining that both certificates are required before final Health Approval.
- Keep the existing lower dashboard sections for this first pass.
- Add a discreet settings action that resets Fitness, Fumigation, and inspection/Health Approval progress while preserving the business profile and kitchen staff.

## Interface

The top dashboard area uses a responsive two-column grid. The business summary is the quieter, larger surface. The certification panel uses the primary brand color, concise copy, a code-native certificate-and-shield illustration, and one button. On small screens the sections stack, with the certification action retained near the top.

The modal uses the shadcn Dialog component. Each certificate option is a full-width navigational row with its current status, adaptive action label, and destination. The modal has an accessible title and description and does not introduce additional certificate types.

Two compact telemetry cards follow the hero row:

- Kitchen staff: the number of registered handlers.
- Certificates: the number of currently valid Fitness and Fumigation certificates, out of two.

An informational Alert beneath them states that final Health Approval becomes available after both certificates are complete.

The Settings account tab places `Reset application progress` beneath the stable account information. An AlertDialog names the preserved and cleared data before confirmation. Resetting clears Fitness applications/history, Fumigation applications/history, and inspection state, then reports success.

## State Boundaries

Each existing feature provider owns its own reset operation. Fitness resets only application and history while retaining handlers. Fumigation returns to its empty state. Inspection returns to its empty state. The settings screen coordinates the three explicit operations; it does not manipulate storage keys directly.

## Accessibility and Motion

- Dialog and confirmation surfaces include visible titles and descriptions.
- Buttons and option rows remain keyboard accessible with visible focus states and 44px minimum touch targets.
- Mobile layout is checked at 390px.
- Motion stays limited to the existing overlay transitions and subtle press feedback; no decorative dashboard entrance animation is added.

## Verification

- Component tests cover the telemetry, modal choices and their adaptive destinations, requirement banner, and reset confirmation.
- Provider tests cover preservation of kitchen staff during reset and clearing of the three application domains.
- Run focused Vitest tests and TypeScript checking for the affected code.
