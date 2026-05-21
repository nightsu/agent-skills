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

[figma-assets-validate] Assets / validation
  status: missing
  recommendation: required_prompt
  reason: pre-handoff validation is recommended before planning
  actions: [R] run  [V] view  [S] skip

Handle required prompts before continuing to handoff.
```

## Expected behavior

- User can run, view, or skip `figma-design-diff` / `figma-ui-handoff` / `figma-assets-validate`.
- Required prompts must be handled before handoff menu appears.
- Skip writes `figma-workflow@engineering-checkpoint` audit to `inputs.md`.
- No business code is written.
