# EHO Inspection Journey Design

## Goal

Make fieldwork and its downstream steps transparent by applying the business fitness application's focused work area and persistent guide pattern after the officer starts an inspection.

## Scope

The inspection overview and notice preparation remain separate pages with their existing layout. The guide begins only after **Start inspection** opens the checklist, then covers fieldwork, review, submission, findings or follow-up, and task closure.

## Layout

- Desktop: a focused work column with a maximum content width of 900px and a persistent right-hand journey guide.
- Mobile and tablet: a compact progress card above the current task showing the active step, completion count, and next action.
- The EHO application sidebar and header remain unchanged.

## Journey

1. Inspect premises — checklist, notes, contraventions, and evidence.
2. Review inspection — validate answers, findings, and attending officers.
3. Submit record — submit or queue the inspection record.
4. Resolve findings — findings notice and follow-up when required; automatically complete when no findings exist.
5. Close task — return to the overview and submit the finished assignment as done.

Completed and current steps are links when their destination is available. Future steps remain unavailable until prerequisites are satisfied. Progress is derived from the existing task-progress, fieldwork, and follow-up records; the guide does not create a second workflow state.

## Guidance

The right rail includes a short “What happens next?” message derived from the next unmet requirement. Copy remains operational and avoids prototype language.

## Accessibility and responsive behavior

- The ordered list uses `aria-current="step"` for the active step.
- Locked steps are rendered as non-interactive text.
- Links retain keyboard focus treatment and descriptive labels.
- At 390px the guide is reduced to the current step and next action without hiding essential progress.

## Verification

Add focused unit coverage for journey derivation and focused browser assertions for the guide, links, and mobile overflow. Run TypeScript and targeted lint checks.
