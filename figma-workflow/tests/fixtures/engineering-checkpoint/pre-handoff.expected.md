# Expected 工程化检查 — pre-handoff

```text
交接前工程化检查:

[figma-design-diff] Design diff
  status: missing
  recommendation: required_prompt
  reason: cache snapshots detected
  actions: [R] run  [V] view  [S] skip

[figma-ui-handoff] UI handoff
  status: missing
  recommendation: recommended
  reason: unknown or open questions detected
  actions: [R] run  [V] view  [S] skip

[figma-assets-validate] Assets / visual validation
  status: missing
  recommendation: required_prompt
  reason: pre-handoff assets, visual baselines, and spec-snapshot checks are recommended before planning
  actions: [R] run  [V] view  [S] skip

Handle required prompts before continuing to handoff.
```

## Expected behavior

- User can run, view, or skip `figma-design-diff` / `figma-ui-handoff` / `figma-assets-validate`.
- P15 generates or validates `assets-manifest.md`, `validation-report.md`, and required visual baselines.
- Required prompts must be handled before handoff menu appears.
- Skip writes `figma-workflow@engineering-checkpoint` audit to `inputs.md`.
- No business code is written.
