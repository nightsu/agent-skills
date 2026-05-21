# Expected 工程化检查 — mid-workflow

```text
流程中工程化检查:

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
```

## Expected behavior

- Mid-workflow prompt is advisory and does not replace current next phase.
- Skip writes `checkpoint: mid-workflow` audit if user chooses skip.
- User can continue A-E flow after run/view/skip.
