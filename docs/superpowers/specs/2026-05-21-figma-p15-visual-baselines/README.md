# Figma P15 Visual Baselines — Design Spec

> Date: 2026-05-21
> Status: Draft, awaiting user review
> Owner: @su
> Builds on:
> - `docs/superpowers/specs/2026-05-21-figma-assets-validation/README.md`
> - `docs/superpowers/specs/2026-05-21-figma-cache-layer/README.md`
> - `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`

---

## TL;DR

P15 `figma-assets-validate` should become the pre-handoff visual consistency checkpoint.

It should download one or more Figma node snapshots into `docs/design/<feature>/snapshots/`, register them as visual baselines, validate that `implementation-spec.md` is consistent with those baselines, and iterate on Phase E/P15 artifacts when the mismatch can be fixed from existing evidence.

It does not perform pixel-level visual regression and does not write business code. Coding agents use the visual baselines later for implementation verification.

---

## Problem

The current figma workflow has structured design facts, API mapping, component mapping, design tokens, and asset validation, but no durable visual baseline in the handoff package.

Phase B calls `get_screenshot`, but that screenshot is only evidence for UI understanding. It is not saved as a handoff artifact, and it is not used to validate whether `implementation-spec.md` itself still matches Figma.

That creates two risks:

- The coding agent may receive a text spec that is subtly inconsistent with the Figma design.
- UI details that are hard to capture as tokens, such as visual hierarchy, card grouping, card counts, state variants, and responsive variants, may drift before implementation begins.

The workflow needs a pre-handoff visual baseline and a lightweight spec-versus-snapshot review loop.

---

## Goals

- Support multiple Figma snapshots per feature.
- Persist snapshots as handoff artifacts under `docs/design/<feature>/snapshots/`.
- Add visual baselines to `assets-manifest.md`.
- Add a `Spec-Snapshot Consistency Check` to `validation-report.md`.
- Ensure `implementation-spec.md` explicitly tells coding agents which snapshots to compare against.
- If P15 detects a spec/snapshot mismatch, self-review and iterate on Phase E/P15 artifacts when the fix is derivable from existing evidence.
- Leave unresolved or product/design-dependent mismatches as open questions or intentional deviations.

## Non-Goals

- No pixel-level visual regression in P15.
- No Playwright implementation screenshots in P15.
- No business code changes.
- No Figma file writes.
- No default downloading of all icon/vector assets.
- No automatic answers to product/design questions.

---

## Baseline Model

Each visual baseline represents one Figma node/state/viewport combination.

Recommended file layout:

```text
docs/design/<feature>/
├── snapshots/
│   ├── default.png
│   ├── default.json
│   ├── narrow.png
│   └── narrow.json
├── assets-manifest.md
├── validation-report.md
└── implementation-spec.md
```

Snapshot metadata should include:

| Field | Rule |
|---|---|
| `id` | Stable kebab-case id, for example `default`, `narrow`, `empty`, `error`. |
| `figma_file_key` | Source Figma file key. |
| `figma_node_id` | Source node id. |
| `source_label` | Human label, for example `数据看板默认态`. |
| `image_path` | Relative path such as `snapshots/default.png`. |
| `metadata_path` | Relative path such as `snapshots/default.json`. |
| `original_width` / `original_height` | Original Figma node dimensions returned by screenshot metadata. |
| `captured_at` | ISO timestamp. |
| `required` | `yes` / `no`. Required baselines must be available before handoff. |
| `purpose` | `implementation_visual_baseline` / `responsive_reference` / `state_reference` / `unknown_purpose`. |

The metadata JSON should be small and stable. It should not include raw Figma JSON.

---

## Baseline Discovery

P15 should discover candidate baselines in this order:

1. `.figma-cache/manifest.json` screenshot metadata or snapshot entries.
2. `inputs.md` records with `figma_file_key` and `figma_node_id`.
3. Figma URLs or node references in `clarified-requirement.md` and `ui-understanding.md`.
4. Node references in `design-diff.md` or `ui-handoff.md`.
5. Existing files under `docs/design/<feature>/snapshots/`.

If exactly one node is found, generate a `default` baseline.

If multiple nodes are found and their purpose is clear from labels or source context, assign stable ids such as `default`, `narrow`, `empty`, and `error`.

If multiple nodes are found but purpose is unclear, register them as `unknown-purpose-1`, `unknown-purpose-2`, and write a validation warning asking for human naming. Unknown-purpose baselines should not silently block implementation unless they are marked required by upstream evidence.

---

## Snapshot Capture

P15 should call Figma MCP `get_screenshot` for each candidate baseline node and download the returned PNG into `docs/design/<feature>/snapshots/`.

Rules:

- Use the selected node itself, not sibling frames.
- Preserve original Figma dimensions in metadata.
- Use stable filenames derived from baseline id, not short-lived asset URLs.
- Existing snapshots can be overwritten only when P15 is rerun for the same feature and node id.
- If screenshot capture fails for a required baseline, P15 should fail the visual baseline check and write a blocking finding.
- If screenshot capture fails for an optional baseline, P15 should warn and keep the open question non-blocking.

The downloaded snapshot is a verification baseline, not a production asset.

---

## Assets Manifest Changes

`assets-manifest.md` should gain a `Visual Baselines` section:

```markdown
## Visual Baselines

| Baseline ID | Figma Node | Image Path | Metadata Path | Required | Purpose | Status | Notes |
|---|---|---|---|---|---|---|---|
| default | 123075:3394 | snapshots/default.png | snapshots/default.json | yes | implementation_visual_baseline | downloaded | Main dashboard node |
```

Visual baselines are also reflected in Summary counts under type `screenshot` or a new type `visual-baseline`.

Baseline rows should not be mixed with production icon/image downloads. They are verification artifacts.

---

## Implementation Spec Changes

`implementation-spec.md` must include a `## Visual Baselines` section before the verification checklist.

Example:

```markdown
## Visual Baselines

| Baseline ID | Image Path | Figma Node | Purpose | Required |
|---|---|---|---|---|
| default | snapshots/default.png | 123075:3394 | implementation_visual_baseline | yes |
| narrow | snapshots/narrow.png | 122736:8704 | responsive_reference | yes |
```

The verification checklist must include:

```markdown
- [ ] 实现后逐个对比 `## Visual Baselines` 中 `Required=yes` 的 snapshot。
- [ ] 对比项至少包括模块数量、标签、主/次层级、布局、颜色、间距、字号比例。
- [ ] 若实现与 snapshot 有 intentional deviation，必须在验证记录中说明原因。
```

This keeps `implementation-spec.md` usable as the single primary input for coding agents. The agent does not need to guess whether snapshots exist or whether they are mandatory.

---

## Spec-Snapshot Consistency Check

`validation-report.md` should gain:

```markdown
## Spec-Snapshot Consistency Check

| Baseline ID | Check | Status | Notes |
|---|---|---|---|
| default | snapshot_exists | pass | snapshots/default.png |
| default | spec_mentions_baseline | pass | Listed in implementation-spec.md |
| default | structure_match | pass | Spec covers 3 groups and 15 metric cards |
```

Recommended checks:

| Check | Purpose |
|---|---|
| `snapshot_exists` | PNG and metadata JSON exist for required baselines. |
| `node_match` | Snapshot metadata file/node matches discovered source. |
| `dimension_recorded` | Original width and height are recorded. |
| `spec_mentions_baseline` | `implementation-spec.md` lists the baseline. |
| `structure_match` | Spec covers key visible structure from the snapshot. |
| `state_or_viewport_match` | State/responsive baselines have matching spec sections. |
| `known_deviation_recorded` | Intentional deviations are explicitly documented. |

The structure check is rule-based and lightweight. It should compare facts such as:

- number of visible business groups
- visible group labels
- number of repeated cards
- primary/secondary card distinction
- expected state name or viewport purpose

It should not attempt pixel-level image comparison.

---

## P15 Self-Review and Iteration Loop

When `Spec-Snapshot Consistency Check` finds a mismatch, P15 must self-review before handing off.

Loop:

1. Run baseline capture and consistency checks.
2. Classify each mismatch:
   - `auto_fixable`: existing evidence is enough to correct Phase E/P15 artifacts.
   - `needs_user_confirmation`: product/design decision is required.
   - `intentional_deviation`: user or upstream artifact already says the implementation should differ from the snapshot.
3. For `auto_fixable` issues, update only Phase E/P15 artifacts:
   - `implementation-spec.md`
   - `assets-manifest.md`
   - `validation-report.md`
   - `open-questions.md`
   - `inputs.md`
4. Rerun the consistency check.
5. Stop when all required baseline checks pass, or remaining issues are blocking open questions / documented intentional deviations.

Iteration limits:

- Maximum two automatic self-review iterations per P15 run.
- If mismatches remain after two iterations, P15 writes a blocking finding instead of continuing to rewrite.

Boundary:

- P15 must not modify business code.
- P15 must not modify Figma.
- P15 should avoid rewriting A-D artifacts. It should prefer Phase E/P15 artifacts because it is validating handoff readiness.
- P15 must not invent product decisions.

`validation-report.md` should record iteration history:

```markdown
## Spec-Snapshot Review Iterations

| Iteration | Finding | Action | Result |
|---:|---|---|---|
| 1 | implementation-spec.md did not list default snapshot | Added Visual Baselines section | pass |
| 1 | snapshot has 15 cards, spec says 14 | Updated MetricCard data binding count from C2 evidence | pass |
```

---

## Coding-Time Verification Contract

P15 only creates and validates baselines before handoff.

After coding, the implementation agent should:

- Start the local app.
- Navigate to the relevant page/state.
- Capture the implemented dashboard region.
- Compare it against all required visual baselines listed in `implementation-spec.md`.
- Verify at least structure, labels, card counts, hierarchy, color family, spacing, and typography scale.
- Record any intentional deviations.

Pixel-level diff can be added later, but is not required for P15.

---

## Workflow Placement

This remains part of P15 `figma-assets-validate`.

It should run after Phase E review gate and before the handoff menu:

```text
Phase E
→ figma-assets-validate
  → capture visual baselines
  → update assets-manifest.md
  → ensure implementation-spec.md lists baselines
  → run spec/snapshot consistency
  → self-review and iterate if needed
  → write validation-report.md
→ handoff menu
```

No new A-E phase is needed.

---

## Required Skill Updates

Implementation should update at least:

- `figma-assets-validate/SKILL.md`
- `figma-assets-validate/references/assets-manifest-template.md`
- `figma-assets-validate/references/validation-report-template.md`
- P15 fixtures and expected outputs
- `figma-emit-spec/SKILL.md` or `figma-emit-spec/references/spec-template.md` if the `Visual Baselines` section needs a stable placeholder before P15 fills it
- `figma-workflow` references if pre-handoff summary should mention visual baseline status

The implementation should preserve the existing rule that P15 is a pre-handoff engineering checkpoint and not a coding entry.

---

## PR Execution Workflow

Changes must be implemented in the `agent-skills` repository:

```text
/Users/su/codeHub/github/agent-skills
```

Use an isolated branch with the `codex/` prefix, for example:

```text
codex/figma-p15-visual-baselines
```

Expected execution:

1. Create branch.
2. Update skill docs/templates/tests/fixtures.
3. Run affected tests or fixture validation.
4. Commit changes.
5. Push branch.
6. Open PR.

The business project `consultan-center` is not the target repository for this workflow change.

---

## Acceptance Criteria

- P15 can register one or more visual baselines.
- P15 can download required baseline snapshots and metadata into `docs/design/<feature>/snapshots/`.
- `assets-manifest.md` includes `Visual Baselines`.
- `implementation-spec.md` includes `Visual Baselines` and coding-time snapshot verification checklist items.
- `validation-report.md` includes `Spec-Snapshot Consistency Check`.
- P15 self-review iteration records auto-fixes and stops after at most two iterations.
- Remaining mismatches are either blocking open questions or documented intentional deviations.
- No business code is modified.
- Existing P15 asset validation behavior remains compatible.

