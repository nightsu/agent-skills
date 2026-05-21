# Figma Workflow v4 Orchestration — Design

> Date: 2026-05-21
> Status: Approved for planning
> Owner: @su
> Related:
> - `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`
> - `docs/superpowers/specs/2026-05-21-figma-design-diff/README.md`
> - `docs/superpowers/specs/2026-05-21-figma-ui-handoff/README.md`
> - `docs/superpowers/specs/2026-05-21-figma-assets-validation/README.md`

---

## Summary

`figma-workflow` should treat v4 capabilities as strongly recommended engineering checkpoints, not as new A-E phases.

The main workflow remains:

```text
A → B → C1 → C2 → D → E
```

v4 capabilities appear in two places:

1. Mid-workflow prompts, when a risk becomes visible before Phase E.
2. A pre-handoff checkpoint after Phase E review gate and before the handoff menu.

The selected policy is:

- Strongly recommend v4 checks when triggered.
- Do not block the user from continuing.
- Do not auto-run any v4 skill.
- Do not auto-rerun or overwrite any Phase A-E product.
- Do not authorize coding.
- Record skip decisions in `docs/design/<feature>/inputs.md`.

---

## Skill Count Model

The main chain keeps 7 skills:

- `figma-workflow`
- `figma-clarify-requirement`
- `figma-ui-understand`
- `figma-api-first`
- `figma-ui-api-mapper`
- `figma-design-token`
- `figma-emit-spec`

v4 adds 3 engineering skills:

- P13 `figma-design-diff`
- P14 `figma-ui-handoff`
- P15 `figma-assets-validate`

P12 cache layer is infrastructure, not a standalone skill.

When v4 is complete, figma-workflow-suite has 10 related skills: 7 main-chain skills + 3 engineering skills.

---

## Orchestration Positions

### Mid-Workflow Prompt

`figma-workflow` may show a v4 prompt after C2 or D if a risk is visible.

Examples:

- P13 `figma-design-diff`: design changed, cache snapshots exist, or Figma refresh changed evidence hash.
- P14 `figma-ui-handoff`: unknown items or open questions are high enough that design/product follow-up is useful.

Mid-workflow prompts are advisory. They do not pause the workflow unless the user chooses to run or view a v4 product.

### Pre-Handoff Checkpoint

After Phase E finishes and the Phase E review gate is accepted, `figma-workflow` shows a v4 pre-handoff checkpoint before the handoff menu.

Order:

```text
Phase E writes implementation-spec.md + open-questions.md
→ Phase E review gate
→ v4 pre-handoff checkpoint
→ handoff menu
→ OpenSpec / planning / task breakdown
→ explicit coding confirmation
→ business code
```

The checkpoint summarizes P13/P14/P15 status and requires each `required_prompt` item to be run, viewed, or skipped before continuing to handoff.

---

## Recommendation Levels

| Level | Meaning |
|---|---|
| `required_prompt` | `figma-workflow` must prompt the user. The user may still skip. |
| `recommended` | Show as recommended when relevant. The user may skip without additional friction. |
| `available` | Show as an available utility only. Do not interrupt flow. |

`required_prompt` is not a hard blocker. It means the orchestrator is responsible for surfacing the risk.

---

## Trigger Rules

| Capability | Mid-workflow trigger | Pre-handoff trigger | Level |
|---|---|---|---|
| P13 `figma-design-diff` | `.figma-cache/snapshots/` has baseline/current; user says design changed; refresh changes evidence hash | snapshots exist and `design-diff.md` is missing or stale | `required_prompt` |
| P14 `figma-ui-handoff` | unknown/open questions are present; user wants to send feedback to design/product | `ui-handoff.md` is missing and unknown/open questions or design diff exist | `recommended` |
| P15 `figma-assets-validate` | user explicitly asks about assets or validation | always after Phase E review gate | `required_prompt` |

P15 is intentionally placed before handoff so `assets-manifest.md` and `validation-report.md` can become planning inputs.

---

## Checkpoint Menu

The pre-handoff checkpoint should be shown outside the A-E progress table.

```text
v4 pre-handoff checkpoint:

[P13] Design diff
  status: not generated
  recommendation: required_prompt
  reason: cache snapshots detected
  actions: [R] run  [V] view  [S] skip

[P14] UI handoff
  status: missing
  recommendation: recommended
  reason: 3 open questions detected
  actions: [R] run  [V] view  [S] skip

[P15] Assets / validation
  status: missing
  recommendation: required_prompt
  reason: pre-handoff validation is recommended before planning
  actions: [R] run  [V] view  [S] skip

After all required prompts are run/viewed/skipped:
  [C] Continue to handoff menu
```

Action semantics:

| Action | Behavior |
|---|---|
| `run` | Invoke the related v4 skill and append its normal audit entry. |
| `view` | Show the existing product path or summary without regenerating it. |
| `skip` | Do not generate a product. Append a skip audit entry. |
| `continue` | Continue to handoff only after all `required_prompt` items are handled. |

`continue` means the current checkpoint was handled. It does not mean all risks were resolved.

---

## Status Values

| Status | Meaning |
|---|---|
| `missing` | Product does not exist. |
| `generated` | Product exists. |
| `stale` | Upstream evidence is newer than the product. |
| `skipped` | User skipped this item in the current checkpoint and an audit entry was written. |
| `not_applicable` | Trigger conditions are not met. |

Status values do not change A-E completion.

---

## Skip Audit

All skip audit records are appended by `figma-workflow` to:

```text
docs/design/<feature>/inputs.md
```

Pre-handoff skip format:

```markdown
## <ISO8601> — figma-workflow@v4-checkpoint

- checkpoint: pre-handoff
- phase_context: after_phase_e_review
- action: skip
- skipped:
  - skill: figma-assets-validate
    product: assets-manifest.md, validation-report.md
    recommendation: required_prompt
    reason: pre-handoff validation recommended
    risk: assets and boundary checks not reviewed before handoff
- continue_to_handoff: true
```

Mid-workflow skip format:

```markdown
## <ISO8601> — figma-workflow@v4-checkpoint

- checkpoint: mid-workflow
- phase_context: after_phase_c_low
- action: skip
- skipped:
  - skill: figma-ui-handoff
    product: ui-handoff.md
    recommendation: recommended
    reason: unknown items detected in component-mapping.md
    risk: design/product follow-up not captured
- continue_workflow: true
```

Rules:

- Skip audit does not create or modify the skipped product.
- Skip audit does not change A-E completion state.
- Skip audit does not mean the risk is resolved.
- If the user later runs the skipped skill, append a normal audit entry and preserve the skip record.

---

## Pre-Handoff Summary

Before showing the handoff menu, `figma-workflow` should summarize core and v4 products.

Example:

```text
Pre-handoff summary:

Core products:
  [✓] implementation-spec.md
  [✓] open-questions.md

v4 checkpoint:
  [✓] design-diff.md
  [S] ui-handoff.md skipped
  [✓] assets-manifest.md
  [✓] validation-report.md

Risk notes:
  - ui-handoff.md skipped: design/product follow-up not captured

Next:
  [1] Builtin — generate task-breakdown.md
  [2] superpowers:writing-plans
  [3] Manual — exit, I'll take implementation-spec.md elsewhere
  [4] Pause for manual edit / answer open questions first
```

This summary does not need a new file in the first version. It is screen output generated by `figma-workflow`.

---

## Handoff Inputs

`implementation-spec.md` remains the primary handoff input.

Additional inputs should be surfaced when present:

| Product | Role in handoff |
|---|---|
| `open-questions.md` | Risk and unresolved question input. |
| `design-diff.md` | Design change impact input. |
| `ui-handoff.md` | Upstream design/product collaboration input, not an implementation spec. |
| `assets-manifest.md` | Asset delivery input before coding. |
| `validation-report.md` | Boundary and contract check input before coding. |

If any `required_prompt` item was skipped, the handoff summary must show risk notes before the user chooses a handoff destination.

---

## Coding Boundary

The coding boundary remains unchanged:

```text
handoff != coding
planning != coding
OpenSpec != coding
```

Business code can only be written after the user explicitly confirms coding.

No v4 checkpoint may invoke a coding agent, modify business source files, or imply permission to start implementation.

---

## Non-Goals

- Do not convert v4 checkpoints into hard blockers.
- Do not auto-run P13/P14/P15.
- Do not auto-rerun Phase A-E.
- Do not overwrite Phase A-E products based on diff or validation output.
- Do not add a new required file to Phase E completion.
- Do not create `handoff-summary.md` in the first version.

---

## Acceptance Criteria

- `figma-workflow` distinguishes A-E phase progress from v4 engineering checkpoints.
- P13/P14 can appear as mid-workflow prompts when triggered.
- P13/P14/P15 are summarized after Phase E review gate and before handoff.
- P15 is always strongly recommended before handoff.
- Users can run, view, or skip each v4 checkpoint item.
- All skipped `required_prompt` items write audit records to `inputs.md`.
- Handoff menu appears only after required prompts are handled or skipped.
- No v4 checkpoint starts coding or changes the Phase E handoff boundary.
