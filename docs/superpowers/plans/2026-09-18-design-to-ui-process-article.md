---
title: "Design-to-UI Process Article Implementation Plan"
---

# Design-to-UI Process Article Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a polished first-person case study and reusable playbook showing designers how structured preparation led to the EHRCMS frontend prototype.

**Architecture:** Create one self-contained Markdown article whose chronological case study is grounded in repository evidence. Follow it with a skills map, lessons, checklist, and reusable prompt framework so readers can apply the method independently.

**Tech Stack:** Markdown, repository source documents, Git history, local Codex skills

---

## File Map

- `docs/from-product-docs-to-generated-ui.md` — finished article for designers
- `docs/superpowers/specs/2026-09-18-design-to-ui-process-article-design.md` — approved editorial specification and acceptance criteria
- `docs/EHRCMS_TanstackStart_Frontend_Prototype_Build_Prompt (1).md` — evidence for stack, visual direction, constraints, and build order
- `docs/superpowers/specs/2026-09-18-ehrcms-frontend-foundation-design.md` — evidence for scoped architecture and first vertical slice
- `docs/superpowers/plans/2026-09-18-ehrcms-frontend-foundation.md` — evidence for planned implementation sequence and verification

### Task 1: Build the Evidence Outline

**Files:**
- Read: `docs/SRS_EHRCMS_Draft 2.md`
- Read: `docs/*End_to_End_UX_Flow_Map.md`
- Read: `docs/*UX_Flow_Screen_Specifications.md`
- Read: `docs/EHRCMS_TanstackStart_Frontend_Prototype_Build_Prompt (1).md`
- Read: `docs/superpowers/specs/2026-09-18-ehrcms-frontend-foundation-design.md`
- Read: `docs/superpowers/plans/2026-09-18-ehrcms-frontend-foundation.md`

- [ ] **Step 1: Confirm the chronological artifact sequence**

Run:

```bash
git log --reverse --date=short --pretty=format:'%h %ad %s'
```

Expected: documentation/design commits precede scaffold, domain, repository, UI foundation, and collaboration-preparation commits.

- [ ] **Step 2: Confirm the article's claims against headings and explicit rules**

Run:

```bash
rg -n '^#{1,3} |Source of Truth|Build Order|Required Frontend Stack|Visual Direction' docs
```

Expected: every process stage in the article maps to a named source section or repository commit.

### Task 2: Draft the Article

**Files:**
- Create: `docs/from-product-docs-to-generated-ui.md`

- [ ] **Step 1: Write the narrative case study**

Cover the path from source requirements through journeys, screen specifications, prototype constraints, stack decisions, reference screenshots, the unified build brief, scoped design, implementation plan, and verified incremental build.

- [ ] **Step 2: Add the skills map**

Distinguish between skills evidenced by named project artifacts and skills reconstructed as useful support. Describe skills by the problem they solve for a designer.

- [ ] **Step 3: Add reusable guidance**

Include lessons, a compact checklist, and a copyable prompt framework that does not depend on the EHRCMS domain.

### Task 3: Editorial Verification

**Files:**
- Verify: `docs/from-product-docs-to-generated-ui.md`
- Compare: `docs/superpowers/specs/2026-09-18-design-to-ui-process-article-design.md`

- [ ] **Step 1: Check required sections and forbidden drift**

Run:

```bash
rg -n '^#|What I did|Why it mattered|Skill|Checklist|Prompt' docs/from-product-docs-to-generated-ui.md
```

Expected: the article contains the case study, skill map, lessons, checklist, and prompt framework without becoming a screen-by-screen UI walkthrough.

- [ ] **Step 2: Scan for placeholders and unsupported certainty**

Run:

```bash
rg -n 'TBD|TODO|PLACEHOLDER|definitely used|certainly used' docs/from-product-docs-to-generated-ui.md
```

Expected: no matches.

- [ ] **Step 3: Check formatting and repository state**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only the planned article and plan-state changes are present.

- [ ] **Step 4: Commit the article**

```bash
git add docs/from-product-docs-to-generated-ui.md docs/superpowers/plans/2026-09-18-design-to-ui-process-article.md
git commit -m "docs: document the design-to-ui workflow"
```
