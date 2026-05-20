# Expected Progress Panel — empty-feature

```text
Feature: referral-home
Dir:     docs/design/referral-home/

Progress:
  [ ] A      clarified-requirement.md          ← next
  [ ] B      ui-understanding.md
  [ ] C-up   api-mapping.md
  [ ] C-low  component-mapping.md
  [ ] D      design-token-patch.md
  [ ] E      implementation-spec.md
  [ ] E      open-questions.md

Next step:
  [1] Create/fill clarified-requirement.md from template (phase A)
  [2] Manually edit a product
  [3] Exit
```

## Expected action

```text
Template: figma-workflow/templates/clarified-requirement.md
Target:   docs/design/referral-home/clarified-requirement.md
```

用户复制模板、删除所有 `<!-- TODO: ... -->` 标记并填写内容后,重新运行:

```text
figma-workflow feature=referral-home
```
