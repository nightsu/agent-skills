# Expected Progress Panel — ready-for-d

```text
Feature: referral-home
Dir:     docs/design/referral-home/

Progress:
  [✓] A      clarified-requirement.md          (handwritten, 1.2 KB)
  [✓] B      ui-understanding.md               (handwritten, 2.4 KB)
  [✓] C-up   api-mapping.md                    (handwritten, 1.8 KB)
  [✓] C-low  component-mapping.md              (figma-ui-api-mapper, 2026-05-20 15:08)
  [ ] D      design-token-patch.md             ← next
  [ ] E      implementation-spec.md
  [ ] E      open-questions.md

Next step:
  [1] Run figma-design-token (phase D)
  [2] Re-run a completed phase
  [3] Manually edit a product
  [4] Exit
```

## Expected action

选择 [1] 后,orchestrator 调用:

```text
figma-design-token feature=referral-home
```

如果当前会话没有 Figma file key / node id,先向用户索取。
